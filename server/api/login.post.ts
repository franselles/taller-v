import prisma from "../lib/prisma";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const { code } = body;

  if (!code) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required",
    });
  }

  const user = await prisma.users.findFirst({
    where: { code },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Invalid user",
    });
  }

  setCookie(event, "user_name", user.name || "Operario", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  // Cookie de SEGURIDAD para el Middleware (httpOnly: true para que JS no la toque)
  setCookie(event, "auth_session", "true", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // Solo true en producción (HTTPS)
  });

  // Aquí podrías generar un token JWT o una sesión
  return {
    message: "Login successful",
    user: {
      id: user.id,
      code: user.code,
      name: user.name,
    },
  };
});
