<script setup lang="ts">
// 1. Interfaz optimizada solo para la consulta del seguro
interface Vehicle {
    id: number;
    model: string;
    plate: string;
    active: boolean;
    insurance: string | null;
    insurance_desc: string | null;
    insurance_phone: string | null;
}

definePageMeta({
    layout: "dash",
});

// 2. Carga de datos
const {
    data: vehicles,
    pending: loading,
    error,
    refresh,
} = await useFetch<Vehicle[]>("/api/vehicles");

const search = ref("");
const filterStatus = ref("all");

// Estados para el modal de coberturas
const selectedInsuranceDesc = ref<string | null>(null);
const selectedVehicleModel = ref("");

const showInsuranceDesc = (model: string, desc: string | null) => {
    selectedVehicleModel.value = model;
    selectedInsuranceDesc.value =
        desc || "No hay detalles específicos registrados sobre las coberturas.";
    (
        document.getElementById("insurance_modal") as HTMLDialogElement
    ).showModal();
};

// 3. Filtrado por texto (Modelo, matrícula o aseguradora) y estado operativo
const filteredVehicles = computed(() => {
    if (!vehicles.value) return [];

    return vehicles.value.filter((v) => {
        const modelName = v.model || "";
        const plateName = v.plate || "";
        const insuranceName = v.insurance || "";

        const matchesSearch =
            modelName.toLowerCase().includes(search.value.toLowerCase()) ||
            plateName.toLowerCase().includes(search.value.toLowerCase()) ||
            insuranceName.toLowerCase().includes(search.value.toLowerCase());

        const matchesStatus =
            filterStatus.value === "all" ||
            (filterStatus.value === "active" && v.active) ||
            (filterStatus.value === "inactive" && !v.active);

        return matchesSearch && matchesStatus;
    });
});
</script>

<template>
    <div class="space-y-6">
        <div class="border-b border-base-300 pb-4">
            <h1 class="text-2xl font-bold tracking-tight text-base-content">
                Consulta de Seguros
            </h1>
            <p class="text-sm text-base-content/60">
                Lista de asistencia rápida y pólizas de la flota de vehículos.
            </p>
        </div>

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
                    placeholder="Buscar por vehículo, matrícula o aseguradora..."
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

        <div
            v-if="error"
            class="alert alert-error shadow-sm text-error-content"
        >
            <Icon name="lucide:triangle-alert" class="w-5 h-5" />
            <span>{{ error }}</span>
        </div>

        <div v-if="loading" class="space-y-3">
            <div class="h-12 bg-base-300 rounded-xl w-full animate-pulse"></div>
            <div
                class="h-16 bg-base-100 rounded-xl w-full border border-base-300 animate-pulse"
                v-for="i in 3"
                :key="i"
            ></div>
        </div>

        <div
            v-else
            class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden"
        >
            <div class="overflow-x-auto w-full">
                <table class="table table-md table-zebra w-full">
                    <thead class="bg-base-200 text-base-content/70">
                        <tr>
                            <th>Vehículo / Matrícula</th>
                            <th>Compañía Aseguradora</th>
                            <th>Teléfono de Asistencia</th>
                            <th>Coberturas y Notas</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-if="filteredVehicles.length === 0">
                            <td
                                colspan="4"
                                class="text-center py-10 text-base-content/50"
                            >
                                <Icon
                                    name="lucide:shield-alert"
                                    class="w-12 h-12 mx-auto mb-2 opacity-30"
                                />
                                <p class="font-medium">
                                    No se encontraron registros
                                </p>
                            </td>
                        </tr>

                        <tr
                            v-for="vehicle in filteredVehicles"
                            :key="vehicle.id"
                            class="hover"
                        >
                            <td>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="p-2 rounded-lg hidden sm:block"
                                        :class="
                                            vehicle.active
                                                ? 'bg-success/10 text-success'
                                                : 'bg-base-300 text-base-content/40'
                                        "
                                    >
                                        <Icon
                                            name="lucide:car"
                                            class="w-5 h-5"
                                        />
                                    </div>
                                    <div>
                                        <div
                                            class="font-bold text-base-content flex items-center gap-2"
                                        >
                                            {{ vehicle.model }}
                                            <span
                                                v-if="!vehicle.active"
                                                class="badge badge-xs opacity-50"
                                                >Inactivo</span
                                            >
                                        </div>
                                        <div
                                            class="text-xs font-mono bg-base-300 px-1.5 py-0.5 rounded text-base-content/70 inline-block mt-0.5 uppercase tracking-wider"
                                        >
                                            {{ vehicle.plate }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td class="font-medium text-sm">
                                <div
                                    v-if="vehicle.insurance"
                                    class="flex items-center gap-2"
                                >
                                    <Icon
                                        name="lucide:shield-check"
                                        class="w-4 h-4 text-success"
                                    />
                                    {{ vehicle.insurance }}
                                </div>
                                <span v-else class="text-xs opacity-40 italic"
                                    >Sin registrar</span
                                >
                            </td>

                            <td class="font-mono text-sm">
                                <a
                                    v-if="vehicle.insurance_phone"
                                    :href="`tel:${vehicle.insurance_phone}`"
                                    class="btn btn-xs btn-outline btn-primary gap-1 font-mono tracking-wider"
                                >
                                    <Icon name="lucide:phone" class="w-3 h-3" />
                                    {{ vehicle.insurance_phone }}
                                </a>
                                <span v-else class="text-xs opacity-40 italic"
                                    >—</span
                                >
                            </td>

                            <td>
                                <button
                                    v-if="vehicle.insurance_desc"
                                    @click="
                                        showInsuranceDesc(
                                            vehicle.model,
                                            vehicle.insurance_desc,
                                        )
                                    "
                                    class="btn btn-xs btn-ghost gap-1.5 normal-case text-info"
                                >
                                    <Icon
                                        name="lucide:file-text"
                                        class="w-3.5 h-3.5"
                                    />
                                    Ver coberturas
                                </button>
                                <span v-else class="text-xs opacity-30 italic"
                                    >Sin detalles</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <dialog id="insurance_modal" class="modal modal-bottom sm:modal-middle">
            <div class="modal-box border border-base-300 shadow-xl">
                <div
                    class="flex items-center gap-2 border-b border-base-300 pb-3 mb-4"
                >
                    <Icon
                        name="lucide:shield-text"
                        class="w-6 h-6 text-primary"
                    />
                    <div>
                        <h3 class="font-bold text-lg">Detalles de la Póliza</h3>
                        <p class="text-xs opacity-60">
                            {{ selectedVehicleModel }}
                        </p>
                    </div>
                </div>
                <p
                    class="text-sm bg-base-200 p-4 rounded-xl font-sans whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto text-base-content/80"
                >
                    {{ selectedInsuranceDesc }}
                </p>
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn btn-sm px-6">Cerrar</button>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>
