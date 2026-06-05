<script setup lang="ts">
// 1. Definimos la interfaz del Vehículo
interface Vehicle {
    id: number;
    model: string;
    plate: string;
    active: boolean;
    km: number | null;
    oil_km: number | null;
    next_oil_km: number | null;
    next_itv_date: string | null;
}

// Forzar el layout
definePageMeta({
    layout: "dash",
});

// 2. Usamos useFetch tipado (Nuxt infiere que la respuesta es de tipo Vehicle[])
const {
    data: vehicles,
    pending: loading,
    error,
    refresh,
} = await useFetch<Vehicle[]>("/api/vehicles");

// Estados para los filtros del frontend
const search = ref("");
const filterStatus = ref("all");

// 3. Filtrado reactivo adaptado a useFetch (añadiendo el .value y control de nulos)
const filteredVehicles = computed(() => {
    // Si useFetch todavía no ha devuelto datos, retornamos un array vacío de seguridad
    if (!vehicles.value) return [];

    return vehicles.value.filter((v) => {
        // Controlamos de forma segura que model y plate existan antes de hacer toLowerCase
        const modelName = v.model || "";
        const plateName = v.plate || "";

        const matchesSearch =
            modelName.toLowerCase().includes(search.value.toLowerCase()) ||
            plateName.toLowerCase().includes(search.value.toLowerCase());

        const matchesStatus =
            filterStatus.value === "all" ||
            (filterStatus.value === "active" && v.active) ||
            (filterStatus.value === "inactive" && !v.active);

        return matchesSearch && matchesStatus;
    });
});

// Helper formatear fechas
const formatDate = (dateString: string | null) => {
    if (!dateString) return "No registrada";
    return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// Helper para el color de la ITV
const getItvStatusClass = (nextItvStr: string | null) => {
    if (!nextItvStr) return "badge-ghost";
    const nextItv = new Date(nextItvStr);
    const today = new Date();
    const diffTime = nextItv.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "badge-error text-error-content";
    if (diffDays <= 30) return "badge-warning text-warning-content";
    return "badge-success text-success-content";
};

function editVehicle(id: number) {
    navigateTo(`/dash/vehicles/edit/${id}`);
}
</script>

<template>
    <div class="space-y-6">
        <!-- Encabezado con acción principal -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-4"
        >
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-base-content">
                    Flota de Vehículos
                </h1>
                <p class="text-sm text-base-content/60">
                    Gestiona las máquinas, kilometrajes e inspecciones técnicas
                    del taller.
                </p>
            </div>
            <NuxtLink
                to="/dash/vehicles/new"
                class="btn btn-primary gap-2 self-start sm:self-auto"
            >
                <Icon name="lucide:plus" class="w-5 h-5" />
                Nuevo Vehículo
            </NuxtLink>
        </div>

        <!-- Barra de Herramientas: Buscador y Filtros -->
        <div
            class="flex flex-col md:flex-row gap-3 bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm"
        >
            <div class="relative flex-1">
                <Icon
                    name="lucide:search"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-5 h-5"
                />
                <input
                    v-model="search"
                    type="text"
                    placeholder="Buscar por modelo o matrícula..."
                    class="input input-bordered w-full pl-10"
                />
            </div>

            <div class="flex gap-2">
                <select
                    v-model="filterStatus"
                    class="select select-bordered w-full md:w-44"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Solo Activos</option>
                    <option value="inactive">Solo Inactivos</option>
                </select>

                <button
                    @click="refresh()"
                    class="btn btn-square btn-bordered"
                    title="Refrescar datos"
                >
                    <Icon
                        name="lucide:refresh-cw"
                        class="w-5 h-5"
                        :class="{ 'animate-spin': loading }"
                    />
                </button>
            </div>
        </div>

        <!-- Alerta de Error si falla la API -->
        <div
            v-if="error"
            class="alert alert-error shadow-sm text-error-content"
        >
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
            <span>{{ error }}</span>
        </div>

        <!-- Estado de Carga (Skeletons de DaisyUI) -->
        <div v-if="loading" class="space-y-3">
            <div class="h-12 bg-base-300 rounded-xl w-full animate-pulse"></div>
            <div
                class="h-20 bg-base-100 rounded-xl w-full border border-base-300 animate-pulse"
                v-for="i in 3"
                :key="i"
            ></div>
        </div>

        <!-- Listado / Tabla principal -->
        <div
            v-else
            class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden"
        >
            <div class="overflow-x-auto w-full">
                <table class="table table-md table-zebra w-full">
                    <!-- Cabecera de la tabla -->
                    <thead class="bg-base-200 text-base-content/70">
                        <tr>
                            <th>Vehículo / Matrícula</th>
                            <th>Estado</th>
                            <th>Kilómetros</th>
                            <th>Mantenimiento Aceite</th>
                            <th>Próxima ITV</th>
                            <th class="text-right">Acciones</th>
                        </tr>
                    </thead>

                    <!-- Cuerpo de la tabla -->
                    <tbody>
                        <!-- Si no hay registros coincidentes -->
                        <tr v-if="filteredVehicles.length === 0">
                            <td
                                colspan="6"
                                class="text-center py-10 text-base-content/50"
                            >
                                <Icon
                                    name="lucide:car-front"
                                    class="w-12 h-12 mx-auto mb-2 opacity-30"
                                />
                                <p class="font-medium">
                                    No se encontraron vehículos
                                </p>
                                <p class="text-xs">
                                    Prueba a cambiar los términos de búsqueda o
                                    añade uno nuevo.
                                </p>
                            </td>
                        </tr>

                        <!-- Iteración de vehículos -->
                        <tr
                            v-for="vehicle in filteredVehicles"
                            :key="vehicle.id"
                            class="hover"
                        >
                            <td>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="p-2 bg-primary/10 text-primary rounded-lg hidden sm:block"
                                    >
                                        <Icon
                                            name="lucide:car"
                                            class="w-5 h-5"
                                        />
                                    </div>
                                    <div>
                                        <div
                                            class="font-bold text-base-content"
                                        >
                                            {{ vehicle.model }}
                                        </div>
                                        <div
                                            class="text-xs font-mono bg-base-300 px-1.5 py-0.5 rounded text-base-content/70 inline-block mt-0.5 uppercase tracking-wider"
                                        >
                                            {{ vehicle.plate }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td>
                                <span
                                    class="badge badge-sm font-semibold"
                                    :class="
                                        vehicle.active
                                            ? 'badge-success text-success-content'
                                            : 'badge-ghost opacity-60'
                                    "
                                >
                                    {{ vehicle.active ? "Activo" : "Parado" }}
                                </span>
                            </td>

                            <td class="font-medium font-mono">
                                {{ vehicle.km?.toLocaleString("es-ES") }} km
                            </td>

                            <td>
                                <div class="text-xs space-y-0.5">
                                    <div>
                                        <span class="opacity-60">Último:</span>
                                        <span class="font-mono">{{
                                            vehicle.oil_km?.toLocaleString(
                                                "es-ES",
                                            ) || "--"
                                        }}</span>
                                    </div>
                                    <div>
                                        <span class="opacity-60">Toca a:</span>
                                        <span
                                            class="font-mono font-semibold text-primary"
                                            >{{
                                                vehicle.next_oil_km?.toLocaleString(
                                                    "es-ES",
                                                ) || "--"
                                            }}</span
                                        >
                                    </div>
                                </div>
                            </td>

                            <td>
                                <span
                                    class="badge badge-sm font-medium"
                                    :class="
                                        getItvStatusClass(vehicle.next_itv_date)
                                    "
                                >
                                    {{ formatDate(vehicle.next_itv_date) }}
                                </span>
                            </td>

                            <!-- Acciones de fila (Editar) -->
                            <td class="text-right">
                                <div class="flex justify-end gap-1">
                                    <button
                                        @click="editVehicle(vehicle.id)"
                                        class="btn btn-square btn-ghost btn-sm border border-base-300 shadow-sm text-info"
                                        title="Editar Vehículo"
                                    >
                                        <Icon
                                            name="lucide:pencil"
                                            class="w-4 h-4"
                                        />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
