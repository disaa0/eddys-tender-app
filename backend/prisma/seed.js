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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });