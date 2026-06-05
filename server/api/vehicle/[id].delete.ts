import prisma from "../../lib/prisma";

export default eventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  const body = await readBody(event);

  try {
    const inspector = await prisma.inspectors.delete({
      where: { id },
    });
    return inspector;
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Inspector no eliminado",
    });
  }
});
