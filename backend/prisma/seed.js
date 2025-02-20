const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Seed UserType
    const userType = await prisma.userType.createMany({
        data: [
            { type: 'Administrador' },
            { type: 'Cliente' },
        ],
    });

    // Seed ProductType
    const productType = await prisma.productType.createMany({
        data: [
            { type: 'Comida' },
            { type: 'Bebidas' },
            { type: 'Extras' },
            { type: 'Postres' },
        ],
    });

    // Seed OrderStatus
    const orderStatus = await prisma.orderStatus.createMany({
        data: [
            { status: 'Pendiente' },
            { status: 'Procesando' },
            { status: 'Listo para recoger' },
            { status: 'Listo para enviar' },
            { status: 'Enviado' },
            { status: 'Entregado' },
            { status: 'Cancelado' },
        ],
    });

    // Seed ShipmentType
    const shipmentType = await prisma.shipmentType.createMany({
        data: [
            { type: 'Envío a domicilio' },
            { type: 'Recoger en tienda' },
        ],
    });

    // Seed PaymentType
    const paymentType = await prisma.paymentType.createMany({
        data: [
            { type: 'Efectivo' },
            { type: 'Tarjeta de crédito' },
            { type: 'Tarjeta de débito' },
        ],
    });

    // Encontrar el id del usuario administrador
    const adminUserType = await prisma.userType.findFirst({
        where: { type: 'Administrador' },
    });

    // Seed User
    const user = await prisma.user.create({
        data: {
            idUserType: adminUserType.idUserType,
            email: "admin@admin.com",
            username: "admin",
            password: "admin",
            status: true,
        },
    });

    // Encontrar el id del usuario
    const userAdmin = await prisma.user.findFirst({
        where: { username: 'admin' },
    });

    // Seed User Information
    const userInformation = await prisma.userInformation.create({
        data: {
            idUser: userAdmin.idUser,
            name: "Administrador",
            lastName: "Administrador",
            phone: "6622757172",
        },
    });

    // Encontrar el id del userInformation
    const userInformationAdmin = await prisma.userInformation.findUnique({
        where: { idUser: userAdmin.idUser },
    });

    // Seed Location
    const location = await prisma.location.create({
        data: {
            idUserInformation: userInformationAdmin.idUserInformation,
            street: "Nouvel",
            houseNumber: "18",
            postalCode: "83288",
            neighborhood: "Jardines de Mónaco",
            status: true,
        },
    });

    // Seed some test products
    const products = await prisma.product.createMany({
        data: [
            {
                idProductType: 1, // Comida
                idUserAdded: userAdmin.idUser,
                name: "Hamburguesa Clásica",
                description: "Hamburguesa con carne, lechuga, tomate y queso",
                price: 89.99,
                status: true,
            },
            {
                idProductType: 1, // Comida
                idUserAdded: userAdmin.idUser,
                name: "Pizza Pepperoni",
                description: "Pizza con pepperoni, queso y salsa de tomate",
                price: 149.99,
                status: true,
            },
            {
                idProductType: 2, // Bebidas
                idUserAdded: userAdmin.idUser,
                name: "Refresco Cola",
                description: "Refresco de cola 600ml",
                price: 25.00,
                status: false, // Producto inactivo para pruebas
            }
        ],
    });

    // Seed some test personalizations
    const personalizations = await prisma.personalization.createMany({
        data: [
            {
                idUserAdded: userAdmin.idUser,
                name: "Sin Cebolla",
                status: true,
            },
            {
                idUserAdded: userAdmin.idUser,
                name: "Extra Queso",
                status: true,
            },
            {
                idUserAdded: userAdmin.idUser,
                name: "Sin Gluten",
                status: true,
            }
        ],
    });

    // Get all products for linking
    const allProducts = await prisma.product.findMany();
    const allPersonalizations = await prisma.personalization.findMany();

    // Link some personalizations to products
    for (const product of allProducts) {
        if (product.idProductType === 1) { // Solo para productos tipo Comida
            for (const personalization of allPersonalizations) {
                await prisma.productPersonalization.create({
                    data: {
                        idProduct: product.idProduct,
                        idPersonalization: personalization.idPersonalization,
                        idUserAdded: userAdmin.idUser,
                        status: true,
                    },
                });
            }
        }
    }

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });