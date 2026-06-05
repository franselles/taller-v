export default defineNuxtRouteMiddleware((to, from) => {
  const userName = useCookie("user_name");

  if (!userName.value && to.path !== "/") {
    return navigateTo("/");
  }

  if (userName.value && to.path === "/") {
    return navigateTo("/dash");
  }
});
