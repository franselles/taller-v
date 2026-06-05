import prisma from "../../lib/prisma";

export default eventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  try {
    const collector = await prisma.vehicles.findUnique({
      where: { id },
    });
    return collector;
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Vehículo no encontrado",
    });
  }
});
