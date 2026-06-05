import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  const body = await readBody(event);

  console.log("Creando nuevo parte de avería:", body);

  // Validaciones mínimas de seguridad
  if (!body.vehicle_id) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "El vehículo es obligatorio para poder abrir un parte de avería.",
    });
  }

  if (!body.fault || body.fault.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "La descripción del fallo no puede estar vacía.",
    });
  }

  try {
    const newReport = await prisma.reports.create({
      data: {
        // 1. Convertir string de fecha a objeto Date real
        date_report: body.date_report ? new Date(body.date_report) : new Date(),

        // 2. Forzar el ID del vehículo a número entero (relación en Prisma)
        vehicle_id: Number(body.vehicle_id),

        // 3. Forzar kilometraje a Int o dejarlo nulo si no se especificó
        km: body.km ? parseInt(body.km, 10) : null,

        // 4. Limpiar textos de fallos y reparaciones
        fault: body.fault.trim(),
        repair: body.repair ? body.repair.trim() : null,

        // 5. Asegurar valor booleano estricto (Abierto = true / Cerrado = false)
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
      // Opcional: hacemos que devuelva los datos básicos del vehículo creado en la respuesta
      include: {
        vehicle: {
          select: {
            model: true,
            plate: true,
          },
        },
      },
    });

    return newReport;
  } catch (error: any) {
    console.error("Error crítico de Prisma al crear reporte:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Error al guardar el parte en la base de datos: ${error.message || "Error interno"}`,
    });
  }
});
