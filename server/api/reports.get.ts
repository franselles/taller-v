import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  try {
    const allReports = await prisma.reports.findMany({
      // Ordenamos para que los partes abiertos y más nuevos salgan arriba
      orderBy: [{ active: "desc" }, { id: "desc" }],
      // ESTO ES CLAVE: Trae los datos de la tabla Vehicles en la misma consulta
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

    return allReports;
  } catch (error) {
    console.error("Error cargando reportes con Prisma:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error interno al obtener los partes de avería",
    });
  }
});
