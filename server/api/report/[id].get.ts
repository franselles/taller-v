import prisma from "../../lib/prisma";

export default eventHandler(async (event) => {
  // 1. Capturar el ID desde los parámetros de la URL de Nitro
  const idParam = getRouterParam(event, "id");
  const reportId = Number(idParam);

  // 2. Validación: Asegurar que el ID proporcionado sea un número válido
  if (!idParam || isNaN(reportId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "El ID del informe proporcionado no es válido.",
    });
  }

  try {
    // 3. Buscar el registro único en la base de datos
    const report = await prisma.reports.findUnique({
      where: {
        id: reportId,
      },
      // ESTO ES CLAVE: Trae adjuntos los datos del vehículo asociado
      include: {
        vehicle: {
          select: {
            id: true,
            model: true,
            plate: true,
          },
        },
      },
    });

    // 4. Si el informe no existe en la BD, devolvemos un 404
    if (!report) {
      throw createError({
        statusCode: 404,
        statusMessage: `No se ha encontrado ningún parte de avería con el ID #${reportId}`,
      });
    }

    return report;
  } catch (error: any) {
    console.error(`Error al obtener el reporte #${reportId}:`, error);

    // Si ya es un error creado por nosotros (como el 404), lo relanzamos
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage:
        "Error interno del servidor al recuperar el parte de avería.",
    });
  }
});
