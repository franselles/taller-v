<script setup lang="ts">
// Forzar el layout del dashboard
definePageMeta({
    layout: "dash",
});

// Interfaces tipadas según tu esquema de Prisma
interface VehicleMin {
    id: number;
    model: string | null;
    plate: string | null;
}

interface Report {
    id: number;
    date_report: string | null; // ISO String de MySQL
    km: number | null;
    fault: string | null;
    repair: string | null;
    active: boolean;
    vehicle_id: number | null;
    vehicle: VehicleMin | null; // Relación traída desde Prisma
}

// 1. Obtener los informes usando useFetch nativo de Nuxt 4
const {
    data: reports,
    pending: loading,
    error,
    refresh,
} = await useFetch<Report[]>("/api/reports");

// Estados para los filtros y buscador del taller
const search = ref("");
const filterState = ref("all"); // "all" | "open" | "resolved"

// 2. Filtrado reactivo en tiempo real (Buscador global + Estado de avería)
const filteredReports = computed(() => {
    if (!reports.value) return [];

    return reports.value.filter((r) => {
        // Campos a evaluar con control de nulos de seguridad
        const faultText = r.fault || "";
        const repairText = r.repair || "";
        const vehicleModel = r.vehicle?.model || "";
        const vehiclePlate = r.vehicle?.plate || "";

        const matchesSearch =
            faultText.toLowerCase().includes(search.value.toLowerCase()) ||
            repairText.toLowerCase().includes(search.value.toLowerCase()) ||
            vehicleModel.toLowerCase().includes(search.value.toLowerCase()) ||
            vehiclePlate.toLowerCase().includes(search.value.toLowerCase());

        const matchesState =
            filterState.value === "all" ||
            (filterState.value === "open" && r.active) ||
            (filterState.value === "resolved" && !r.active);

        return matchesSearch && matchesState;
    });
});

// Función para redirigir a la edición/gestión del parte de avería
const editReport = (id: number) => {
    navigateTo(`/dash/reports/edit/${id}`);
};

// Helper para formatear las fechas de los partes
const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};
</script>

<template>
    <div class="space-y-6">
        <!-- Encabezado Principal -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-4"
        >
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-base-content">
                    Partes de Averías e Informes
                </h1>
                <p class="text-sm text-base-content/60">
                    Registra incidencias, gestiona reparaciones y mantén al día
                    el histórico de la flota.
                </p>
            </div>
            <NuxtLink
                to="/dash/reports/new"
                class="btn btn-primary gap-2 self-start sm:self-auto"
            >
                <Icon name="lucide:plus" class="w-5 h-5" />
                Nuevo Parte
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
                    placeholder="Buscar por avería, modelo o matrícula..."
                    class="input input-bordered w-full pl-10"
                />
            </div>

            <div class="flex gap-2">
                <select
                    v-model="filterState"
                    class="select select-bordered w-full md:w-48"
                >
                    <option value="all">Todos los partes</option>
                    <option value="open">🛠️ Activos / En Taller</option>
                    <option value="resolved">✅ Reparados / Cerrados</option>
                </select>

                <button
                    @click="refresh()"
                    class="btn btn-square btn-bordered"
                    title="Refrescar listado"
                >
                    <Icon
                        name="lucide:refresh-cw"
                        class="w-5 h-5"
                        :class="{ 'animate-spin': loading }"
                    />
                </button>
            </div>
        </div>

        <!-- Alerta de Error si falla la conexión -->
        <div
            v-if="error"
            class="alert alert-error shadow-sm text-error-content"
        >
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
            <span
                >Error al conectar con el servidor de informes. Inténtalo de
                nuevo.</span
            >
        </div>

        <!-- Skeletons Animados mientras carga -->
        <div v-if="loading" class="space-y-3">
            <div class="h-12 bg-base-300 rounded-xl w-full animate-pulse"></div>
            <div
                class="h-24 bg-base-100 rounded-xl w-full border border-base-300 animate-pulse"
                v-for="i in 3"
                :key="i"
            ></div>
        </div>

        <!-- Tabla de Informes -->
        <div
            v-else
            class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden"
        >
            <div class="overflow-x-auto w-full">
                <table class="table table-md table-zebra w-full">
                    <thead class="bg-base-200 text-base-content/70">
                        <tr>
                            <th>Nº Parte</th>
                            <th>Fecha / Vehículo</th>
                            <th>Kilómetros</th>
                            <th class="w-1/3">Descripción del Fallo</th>
                            <th class="w-1/3">Solución / Reparación</th>
                            <th>Estado</th>
                            <th class="text-right">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        <!-- Estado vacío -->
                        <tr v-if="filteredReports.length === 0">
                            <td
                                colspan="6"
                                class="text-center py-12 text-base-content/50"
                            >
                                <Icon
                                    name="lucide:wrench"
                                    class="w-12 h-12 mx-auto mb-2 opacity-20 text-primary"
                                />
                                <p class="font-medium">
                                    No se han encontrado partes de avería
                                </p>
                                <p class="text-xs">
                                    No hay incidencias que coincidan con los
                                    criterios de búsqueda.
                                </p>
                            </td>
                        </tr>

                        <!-- Iteración de Informes -->
                        <tr
                            v-for="report in filteredReports"
                            :key="report.id"
                            class="hover align-top"
                        >
                            <td
                                class="py-4 font-bold font-mono text-primary text-base"
                            >
                                #{{ report.id }}
                            </td>
                            <!-- Columna 1: Fecha e Identificación del coche -->
                            <td class="py-4">
                                <div class="space-y-1">
                                    <div
                                        class="text-xs font-semibold text-base-content/60 flex items-center gap-1"
                                    >
                                        <Icon
                                            name="lucide:calendar"
                                            class="w-3.5 h-3.5"
                                        />
                                        {{ formatDate(report.date_report) }}
                                    </div>
                                    <div v-if="report.vehicle">
                                        <div
                                            class="font-bold text-sm text-base-content"
                                        >
                                            {{ report.vehicle.model }}
                                        </div>
                                        <div
                                            class="text-[11px] font-mono bg-base-300 px-1.5 py-0.2 rounded text-base-content/80 inline-block uppercase tracking-wider"
                                        >
                                            {{ report.vehicle.plate }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="text-xs text-error font-medium"
                                    >
                                        Vehículo no asignado
                                    </div>
                                </div>
                            </td>

                            <!-- Columna 2: Kilómetros en el momento del fallo -->
                            <td class="font-mono text-sm font-medium py-4">
                                {{
                                    report.km
                                        ? `${report.km.toLocaleString("es-ES")} km`
                                        : "--"
                                }}
                            </td>

                            <!-- Columna 3: El problema -->
                            <td class="py-4">
                                <p
                                    class="text-sm font-medium line-clamp-2 text-base-content"
                                    :title="report.fault || ''"
                                >
                                    {{
                                        report.fault ||
                                        "Sin descripción del fallo."
                                    }}
                                </p>
                            </td>

                            <!-- Columna 4: La reparación -->
                            <td class="py-4">
                                <p
                                    v-if="report.repair"
                                    class="text-sm text-success line-clamp-2"
                                    :title="report.repair"
                                >
                                    {{ report.repair }}
                                </p>
                                <span
                                    v-else
                                    class="text-xs italic text-base-content/40 flex items-center gap-1"
                                >
                                    <Icon
                                        name="lucide:clock"
                                        class="w-3.5 h-3.5"
                                    />
                                    Pendiente de revisión
                                </span>
                            </td>

                            <!-- Columna 5: Estado del parte -->
                            <td class="py-4">
                                <span
                                    class="badge badge-sm font-semibold p-2"
                                    :class="
                                        report.active
                                            ? 'badge-warning text-warning-content'
                                            : 'badge-success text-success-content'
                                    "
                                >
                                    {{
                                        report.active
                                            ? "Taller / Abierto"
                                            : "Reparado"
                                    }}
                                </span>
                            </td>

                            <!-- Columna 6: Acciones -->
                            <td class="text-right py-4">
                                <div class="flex justify-end gap-1">
                                    <button
                                        @click="editReport(report.id)"
                                        class="btn btn-square btn-ghost btn-sm border border-base-300 shadow-sm text-info"
                                        title="Editar parte de avería"
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
