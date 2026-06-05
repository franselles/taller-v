import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  const response = await readBody(event);

  try {
    const newVehicle = await prisma.vehicles.create({
      data: {
        model: response.model || "",
        plate: response.plate || "",
        km: Number(response.km) || 0,
        itv_date: new Date(response.itv_date) || null,
        next_itv_date: new Date(response.next_itv_date) || null,
        oil_km: Number(response.oil_km) || 0,
        next_oil_km: Number(response.next_oil_km) || 0,
        active: Boolean(response.active) || false,
      },
    });
    return newVehicle;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error al crear el vehículo",
    });
  }
});
