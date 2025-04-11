const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const paymentService = require('./payment.service');

/**
 * Create a new order from a user's active cart
 * @param {number} userId - The user ID
 * @param {Object} orderData - Order details including payment and shipping info
 * @returns {Object} - The created order with payment intent
 */
async function createOrder(userId, orderData) {
  const {
    idPaymentType,
    idShipmentType,
    idLocation,
    shipmentValue = 0,
  } = orderData;

  // Double-check location requirement for delivery orders
  if (idShipmentType === 1 && !idLocation) {
    throw new Error(
      'Se requiere una dirección de entrega para envíos a domicilio'
    );
  }

  let orderResult;

  // Execute the order creation in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Find user's active cart
    const cart = await tx.cart.findFirst({
      where: {
        idUser: userId,
        status: true,
      },
      include: {
        itemsCart: {
          where: { status: true },
          include: { product: true },
        },
      },
    });

    if (!cart || cart.itemsCart.length === 0) {
      throw new Error('No hay productos en el carrito');
    }

    // 2. Calculate total price from cart items
    const itemsTotal = cart.itemsCart.reduce((sum, item) => {
      return sum + item.quantity * item.individualPrice;
    }, 0);

    // Add shipment value to total price (if it's a delivery order)
    // For pickup orders, we'll set shipmentValue to 0 regardless of input
    const finalShipmentValue = idShipmentType === 1 ? shipmentValue : 0;
    const totalPrice = itemsTotal + finalShipmentValue;

    // 3. Create the order
    const order = await tx.order.create({
      data: {
        idCart: cart.idCart,
        idPaymentType,
        idShipmentType,
        idOrderStatus: 1, // Assuming 1 is 'Pendiente'
        idLocation: idLocation || null,
        totalPrice,
        shipmentValue: finalShipmentValue,
        paid: false,
      },
    });

    // Store the created order to use after transaction completes
    orderResult = order;
  });

  // Now that the transaction has committed, the order is visible in the database

  // 5. If it's a card payment (PaymentType 2 or 3), create payment intent
  if (idPaymentType === 2 || idPaymentType === 3) {
    // Tarjeta de crédito o débito
    const paymentIntent = await paymentService.createPaymentIntent(
      orderResult.idOrder,
      orderResult.totalPrice
    );

    // Use the updated order that includes Stripe fields
    return {
      order: paymentIntent.order, // Use this instead of orderResult
      paymentDetails: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      },
    };
  }

  // 6. For cash payments, just return the order
  return { order: orderResult };
}

/**
 * Get order details for a specific order
 * @param {number} orderId - The order ID
 * @param {number} userId - The user ID for authorization
 * @returns {Object} - The order details with related information
 */
async function getOrderDetails(orderId, userId) {
  // Check if order exists and belongs to this user
  const order = await prisma.order.findFirst({
    where: {
      idOrder: orderId,
      cart: { idUser: userId },
    },
    include: {
      cart: {
        include: {
          itemsCart: {
            include: { product: true },
          },
        },
      },
      paymentType: true,
      shipmentType: true,
      orderStatus: true,
    },
  });

  if (!order) {
    throw new Error('Orden no encontrada');
  }

  return order;
}

/**
 * Get all orders for a user
 * @param {number} userId - The user ID
 * @returns {Array} - List of user's orders
 */
async function getUserOrders(userId) {
  const orders = await prisma.order.findMany({
    where: {
      cart: { idUser: userId },
    },
    include: {
      orderStatus: true,
      shipmentType: true,
      paymentType: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

/**
 * Process Stripe webhook events
 * @param {Object} event - The Stripe event object
 * @returns {Object} - Processing result
 */
async function processStripeEvent(event) {
  const { type, data } = event;

  // Handle different event types
  switch (type) {
    case 'payment_intent.succeeded':
      return await handlePaymentSucceeded(data.object);

    case 'payment_intent.payment_failed':
      return await handlePaymentFailed(data.object);

    // You can add more event types as needed
    default:
      return { handled: false, message: `Evento no procesado: ${type}` };
  }
}

/**
 * Handle successful payment
 * @param {Object} paymentIntent - The payment intent object
 * @returns {Object} - Updated order info
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    // Find order by payment intent ID
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { cart: true },
    });

    if (!order) {
      throw new Error(
        `No se encontró una orden con el pago ${paymentIntent.id}`
      );
    }

    // Execute database operations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update order status to paid
      const updatedOrder = await tx.order.update({
        where: { idOrder: order.idOrder },
        data: {
          paid: true,
          paidAt: new Date(),
          idOrderStatus: 4, // 4 is "Listo para enviar"
          stripePaymentStatus: paymentIntent.status,
        },
      });

      // 2. Disable the cart associated with the order
      await tx.cart.update({
        where: { idCart: order.idCart },
        data: { status: false },
      });

      // 3. Create a notification for the successful payment
      const notification = await tx.notification.create({
        data: {
          idOrder: order.idOrder,
          title: 'Pago recibido',
          message: `El pago de $${order.totalPrice} ha sido procesado exitosamente.`,
          status: true,
        },
      });

      return {
        updatedOrder,
        notification,
      };
    });

    console.log(
      `Order ${order.idOrder} paid successfully and cart ${order.idCart} disabled`
    );

    return {
      success: true,
      order: result.updatedOrder,
      cartDisabled: true,
    };
  } catch (error) {
    console.error('Error handling payment success:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle failed payment
 * @param {Object} paymentIntent - The payment intent object
 * @returns {Object} - Updated order info
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    // Find order by payment intent ID
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      throw new Error(
        `No se encontró una orden con el pago ${paymentIntent.id}`
      );
    }

    // Update order to reflect failed payment
    const updatedOrder = await prisma.order.update({
      where: { idOrder: order.idOrder },
      data: {
        stripePaymentStatus: paymentIntent.status,
        idOrderStatus: 6, // Assuming 6 is "Payment Failed"
      },
    });

    // Create a notification for the failed payment
    await prisma.notification.create({
      data: {
        idOrder: order.idOrder,
        title: 'Pago rechazado',
        message: `El pago de $${order.totalPrice} ha sido rechazado. Motivo: ${paymentIntent.last_payment_error?.message || 'Error de procesamiento'}`,
        status: true,
      },
    });

    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error handling payment failure:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search orders with filters
 * @param {number} userId - The user ID
 * @param {Object} filters - Search filters and pagination options
 * @returns {Object} - Filtered orders with pagination info
 */
async function searchOrders(userId, filters) {
  const {
    startDate,
    endDate,
    orderStatus,
    paid,
    paymentType,
    shipmentType,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
  } = filters;

  // Build where clause
  const where = {
    cart: { idUser: userId },
  };

  // Add date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // Add order status filter
  if (orderStatus) {
    where.idOrderStatus = parseInt(orderStatus);
  }

  // Add payment status filter
  if (paid !== undefined) {
    where.paid = paid === 'true';
  }

  // Add payment type filter
  if (paymentType) {
    where.idPaymentType = parseInt(paymentType);
  }

  // Add shipment type filter
  if (shipmentType) {
    where.idShipmentType = parseInt(shipmentType);
  }

  // Add price range filter
  if (minPrice || maxPrice) {
    where.totalPrice = {};
    if (minPrice) where.totalPrice.gte = parseFloat(minPrice);
    if (maxPrice) where.totalPrice.lte = parseFloat(maxPrice);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total count for pagination
  const totalCount = await prisma.order.count({ where });

  // Get orders with filters
  const orders = await prisma.order.findMany({
    where,
    include: {
      orderStatus: true,
      paymentType: true,
      shipmentType: true,
    },
    skip,
    take: parseInt(limit),
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    orders,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
    },
  };
}

// Get all active orders from all users for the admin panel (where order status could be set to multiple numbers from 1 to 7) with pagination
async function getOrdersByStatus({ status, page = 1, limit = 10 }) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    idOrderStatus: status,
  };

  const totalCount = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    include: {
      orderStatus: true,
      paymentType: true,
      shipmentType: true,
    },
    skip,
    take: parseInt(limit),
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Sanitize the order data , removing stripe client secret, with the map function

  const sanitizedOrders = orders.map((order) => {
    const { stripeClientSecret, ...rest } = order;
    return rest;
  });

  // Return the sanitized orders
  return {
    orders: sanitizedOrders,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
    },
  };
}

async function reorderService(userId, orderId) {
  return await prisma.$transaction(async (tx) => {
    const userExists = await tx.user.findUnique({
      where: { idUser: userId },
    });
    if (!userExists) {
      throw new Error('Usuario no existe');
    }

    const order = await tx.order.findUnique({
      where: { idOrder: orderId },
      include: {
        cart: {
          include: {
            itemsCart: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (order.cart.idUser !== userId) {
      throw new Error('La orden no pertenece al usuario');
    }

    const items = order.cart.itemsCart.map((item) => ({
      idProduct: item.idProduct,
      quantity: item.quantity,
    }));

    const activeProducts = await tx.product.findMany({
      where: {
        idProduct: { in: items.map((item) => item.idProduct) },
        status: true,
      },
    });

    const itemsToAdd = activeProducts.map((product) => {
      const item = items.find((i) => i.idProduct === product.idProduct);
      return {
        idProduct: product.idProduct,
        quantity: item.quantity,
        individualPrice: product.price,
        status: true,
      };
    });

    // validate if itemsToAdd is empty
    if (itemsToAdd.length === 0) {
      throw new Error(
        'Ninguno de los productos de la orden esta disponible actualmente'
      );
    }

    let cart = await tx.cart.findFirst({
      where: {
        idUser: userId,
        status: true,
      },
      include: {
        itemsCart: true,
      },
    });

    if (cart) {
      const existingItems = cart.itemsCart.map((item) => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
      }));

      const areSameItems =
        existingItems.length === itemsToAdd.length &&
        existingItems.every((existingItem) =>
          itemsToAdd.some(
            (newItem) =>
              newItem.idProduct === existingItem.idProduct &&
              newItem.quantity === existingItem.quantity
          )
        );

      if (areSameItems) {
        throw new Error('El carrito ya contiene los mismos productos');
      }

      await tx.cart.update({
        where: { idCart: cart.idCart },
        data: { status: false },
      });
    }

    cart = await tx.cart.create({
      data: {
        idUser: userId,
        status: true,
      },
    });

    const itemsWithCartId = itemsToAdd.map((item) => ({
      ...item,
      idCart: cart.idCart,
    }));

    const itemsCreated = await tx.itemCart.createMany({
      data: itemsWithCartId,
    });

    if (!itemsCreated) {
      throw new Error('Error al agregar productos al carrito');
    }

    return {
      cartId: cart.idCart,
      items: itemsWithCartId,
    };
  });
}

module.exports = {
  createOrder,
  getOrderDetails,
  getUserOrders,
  processStripeEvent,
  searchOrders,
  getOrdersByStatus,
  reorderService,
};
