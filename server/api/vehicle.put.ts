import { nextTick } from "vue";
import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  //const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    const updateData: any = {
      model: body.model.toUpperCase().toUpperCase() || "",
      plate: body.plate.toUpperCase().toUpperCase() || "",
      itv_date: new Date(body.itv_date),
      next_itv_date: new Date(body.next_itv_date),
      oil_km: Number(body.oil_km),
      next_oil_km: Number(body.next_oil_km),
      km: Number(body.km),
      insurance: body.insurance?.toUpperCase() || "",
      insurance_desc: body.insurance_desc?.toUpperCase() || "",
      insurance_phone: body.insurance_phone?.toUpperCase() || "",
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
