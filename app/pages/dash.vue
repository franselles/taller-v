<script setup lang="ts">
const handleLogout = async () => {
    useCookie("user_name").value = null;
    useCookie("auth_session").value = null;
    await navigateTo("/");
};
</script>

<template>
    <div class="flex min-h-screen bg-base-200">
        <aside
            class="w-64 bg-base-100 border-r border-base-300 flex-col justify-between hidden md:flex"
        >
            <div>
                <div
                    class="p-4 border-b border-base-300 flex items-center gap-2"
                >
                    <div
                        class="p-2 bg-primary text-primary-content rounded-xl font-bold tracking-wider text-sm"
                    >
                        GT
                    </div>
                    <div>
                        <h1 class="font-bold text-sm text-base-content">
                            GESTIÓN DE TALLER
                        </h1>
                        <span class="text-xs text-base-content/60"
                            >Panel de Control</span
                        >
                    </div>
                </div>

                <ul class="menu menu-md p-4 w-full gap-1">
                    <li
                        class="menu-title text-xs font-semibold opacity-50 tracking-wider"
                    >
                        OPERACIONES
                    </li>
                    <li>
                        <NuxtLink
                            to="/dash"
                            exact-active-class="active"
                            class="flex items-center gap-3"
                        >
                            <Icon
                                name="lucide:layout-dashboard"
                                class="w-5 h-5"
                            />
                            Inicio
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink
                            to="/dash/vehicles"
                            active-class="active"
                            class="flex items-center gap-3"
                        >
                            <Icon name="lucide:car" class="w-5 h-5" />
                            Listado Vehículos
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink
                            to="/dash/reports"
                            active-class="active"
                            class="flex items-center gap-3"
                        >
                            <Icon name="lucide:wrench" class="w-5 h-5" />
                            Averías
                        </NuxtLink>
                    </li>
                </ul>
            </div>

            <div class="p-4 border-t border-base-300">
                <button
                    @click="handleLogout"
                    class="btn btn-ghost text-error btn-sm w-full justify-start gap-3 h-10 normal-case"
                >
                    <Icon name="lucide:log-out" class="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
            <header
                class="navbar bg-base-100 border-b border-base-300 px-4 justify-between sticky top-0 z-10"
            >
                <div class="flex items-center gap-2">
                    <button class="btn btn-square btn-ghost md:hidden">
                        <Icon name="lucide:menu" class="w-5 h-5" />
                    </button>
                    <span class="font-semibold text-lg md:hidden"
                        >Gestión de Taller</span
                    >
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex-col items-end hidden sm:flex">
                        <span class="text-sm font-medium">Operario Taller</span>
                        <span class="text-xs text-base-content/60"
                            >En línea</span
                        >
                    </div>
                    <div class="avatar placeholder">
                        <div
                            class="bg-neutral text-neutral-content w-10 rounded-full"
                        >
                            <span>OP</span>
                        </div>
                    </div>
                </div>
            </header>

            <main class="p-6 flex-1 max-w-7xl w-full mx-auto">
                <NuxtPage />
            </main>
        </div>
    </div>
</template>

<style scoped></style>
