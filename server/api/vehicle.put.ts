import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  //const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    const updateData: any = {
      model: body.model,
      plate: body.plate,
      km: Number(body.km),
    };

    const vehicle = await prisma.vehicles.update({
      where: {
        id: Number(body.id),
      },
      data: updateData,
    });

    return vehicle;
  } catch (error) {
    console.error("Prisma Error:", error);
    throw createError({
      statusCode: 500,
      message: "Error al actualizar el vehículo",
    });
  }
});
