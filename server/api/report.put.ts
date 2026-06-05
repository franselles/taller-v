import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  // 1. Leer el cuerpo de la petición enviado por $fetch
  const body = await readBody(event);

  console.log("Actualizando parte de avería:", body);

  // 2. Validación de seguridad indispensable: necesitamos el ID para el WHERE
  if (!body.id || isNaN(Number(body.id))) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "El identificador (ID) del informe es obligatorio para poder editarlo.",
    });
  }

  try {
    // 3. Ejecutar la actualización parcial en la base de datos
    const updatedReport = await prisma.reports.update({
      where: {
        id: Number(body.id),
      },
      data: {
        // Solo actualizamos los campos si vienen en el body, respetando los nulos limpianamente
        ...(body.date_report !== undefined && {
          date_report: body.date_report ? new Date(body.date_report) : null,
        }),

        ...(body.km !== undefined && {
          km: body.km ? parseInt(body.km, 10) : null,
        }),

        ...(body.fault !== undefined && {
          fault: body.fault ? body.fault.trim() : null,
        }),

        ...(body.repair !== undefined && {
          repair: body.repair ? body.repair.trim() : null,
        }),

        ...(body.active !== undefined && {
          active: Boolean(body.active),
        }),
      },
    });

    return updatedReport;
  } catch (error: any) {
    console.error("Error crítico de Prisma al actualizar el reporte:", error);

    // Si Prisma no encuentra el registro, lanza el código de error P2025
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage:
          "No se encontró ningún parte de avería con el ID proporcionado.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno al actualizar el informe en la base de datos: ${error.message || ""}`,
    });
  }
});
