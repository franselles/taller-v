import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  try {
    const vehicles = await prisma.vehicles.findMany();
    return vehicles;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error al obtener los vehículos",
    });
  }
});
