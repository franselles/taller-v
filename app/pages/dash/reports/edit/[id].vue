<script setup lang="ts">
// Forzar el layout del dashboard
definePageMeta({
    layout: "dash",
});

// Interfaces para el tipado estricto según esquema de Prisma
interface VehicleMin {
    id: number;
    model: string | null;
    plate: string | null;
}

interface Report {
    id: number;
    date_report: Date | null; // Tipado estricto como Date
    km: number | null;
    fault: string | null;
    repair: string | null;
    active: boolean;
    vehicle_id: number | null;
    vehicle: VehicleMin | null;
}

// 1. Capturar el ID del informe desde los parámetros de la URL de Nuxt
const route = useRoute();
const reportId = route.params.id;

// Estado reactivo del formulario local (el input HTML usa cadenas de texto YYYY-MM-DD)
const form = ref({
    date_report: "",
    km: null as number | null,
    fault: "",
    repair: "",
    active: true,
    vehicle_id: null as number | null,
});

const saving = ref(false);
const statusMessage = ref<{ type: "success" | "error"; text: string } | null>(
    null,
);

// 2. Cargar los datos actuales de este parte de avería desde la API
const {
    data: currentReport,
    pending: loading,
    error: loadError,
} = await useFetch<Report>(`/api/report/${reportId}`);

// Observador para mapear los datos de la base de datos al formulario local
watch(
    currentReport,
    (newData) => {
        if (newData) {
            form.value = {
                // Usamos 'sv-SE' para forzar de forma nativa y segura el formato YYYY-MM-DD que exige el input date
                date_report: newData.date_report
                    ? new Date(newData.date_report).toLocaleDateString("sv-SE")
                    : "",
                km: newData.km,
                fault: newData.fault || "",
                repair: newData.repair || "",
                active: newData.active,
                vehicle_id: newData.vehicle_id,
            };
        }
    },
    { immediate: true },
);

// 3. Guardar los cambios mediante una petición PUT usando $fetch bajo demanda
const handleSubmit = async () => {
    saving.value = true;
    statusMessage.value = null;

    try {
        await $fetch("/api/report", {
            method: "PUT",
            body: {
                id: Number(reportId), // Indispensable para el filtrado WHERE en el backend
                date_report: form.value.date_report
                    ? new Date(form.value.date_report)
                    : null,
                km: form.value.km ? Number(form.value.km) : null,
                fault: form.value.fault,
                repair: form.value.repair || null,
                active: form.value.active,
            },
        });

        statusMessage.value = {
            type: "success",
            text: `Los cambios del Parte de Avería #${reportId} se han guardado correctamente.`,
        };

        // Regresar al panel de listado tras 1.5 segundos
        setTimeout(() => {
            navigateTo("/dash/reports");
        }, 1500);
    } catch (error: any) {
        console.error("Error al actualizar el reporte:", error);
        statusMessage.value = {
            type: "error",
            text:
                error.statusMessage ||
                "No se pudieron salvar las modificaciones del informe.",
        };
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-base-300 pb-4"
        >
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-base-content">
                    Gestionar / Editar Parte
                    <span class="text-primary font-mono font-black"
                        >#{{ reportId }}</span
                    >
                </h1>
                <p class="text-sm text-base-content/60">
                    Modifica el diagnóstico técnico o añade las tareas de
                    reparación ejecutadas.
                </p>
            </div>
            <NuxtLink
                to="/dash/averias"
                class="btn btn-ghost btn-sm gap-2 self-start sm:self-auto"
            >
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Volver al listado
            </NuxtLink>
        </div>

        <div
            v-if="loading"
            class="flex flex-col items-center justify-center py-12 bg-base-100 rounded-xl border border-base-300 shadow-sm"
        >
            <span
                class="loading loading-spinner loading-lg text-primary mb-3"
            ></span>
            <p class="text-sm font-medium text-base-content/70">
                Abriendo orden de trabajo del parte #{{ reportId }}...
            </p>
        </div>

        <div
            v-else-if="loadError"
            class="alert alert-error shadow-sm text-error-content"
        >
            <Icon name="lucide:triangle-alert" class="w-5 h-5 shrink-0" />
            <span
                >El parte de avería que intentas editar no existe en el sistema
                o ha sido eliminado.</span
            >
        </div>

        <div v-else class="card bg-base-100 shadow-sm border border-base-300">
            <form @submit.prevent="handleSubmit" class="card-body gap-6">
                <div
                    v-if="statusMessage"
                    class="alert shadow-sm"
                    :class="
                        statusMessage.type === 'success'
                            ? 'alert-success text-success-content font-bold'
                            : 'alert-error text-error-content'
                    "
                >
                    <Icon
                        :name="
                            statusMessage.type === 'success'
                                ? 'lucide:circle-check'
                                : 'lucide:triangle-alert'
                        "
                        class="w-5 h-5 shrink-0"
                    />
                    <span>{{ statusMessage.text }}</span>
                </div>

                <div
                    class="bg-base-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-base-300"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="p-3 bg-primary text-primary-content rounded-xl font-mono font-black text-xl shadow-inner"
                        >
                            #{{ reportId }}
                        </div>
                        <div>
                            <span
                                class="text-xs font-semibold opacity-50 uppercase tracking-wider block"
                                >Máquina / Vehículo Vinculado</span
                            >
                            <h3 class="font-bold text-base text-base-content">
                                {{
                                    currentReport?.vehicle?.model ||
                                    "Sin especificar"
                                }}
                            </h3>
                        </div>
                    </div>
                    <div class="sm:text-right">
                        <span class="text-xs opacity-50 block font-medium"
                            >Placa de Matrícula</span
                        >
                        <span
                            class="font-mono bg-base-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide text-base-content/90"
                        >
                            {{ currentReport?.vehicle?.plate || "--" }}
                        </span>
                    </div>
                </div>

                <div>
                    <h2
                        class="text-xs font-bold text-primary uppercase tracking-wider mb-3"
                    >
                        Control de Entrada
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Fecha de Apertura del Reporte</span
                                ></label
                            >
                            <input
                                v-model="form.date_report"
                                type="date"
                                class="input input-bordered w-full"
                                required
                                :disabled="saving"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Kilómetros al Entrar al Taller</span
                                ></label
                            >
                            <input
                                v-model="form.km"
                                type="number"
                                placeholder="Ej: 85200"
                                class="input input-bordered w-full font-mono"
                                min="0"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-xs font-bold text-primary uppercase tracking-wider mb-3"
                    >
                        Informes de Mecánica
                    </h2>
                    <div class="space-y-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Descripción de la Avería / Síntomas
                                    reportados</span
                                ></label
                            >
                            <textarea
                                v-model="form.fault"
                                rows="4"
                                class="textarea textarea-bordered w-full text-base"
                                required
                                :disabled="saving"
                            ></textarea>
                        </div>

                        <div class="form-control w-full">
                            <label class="label">
                                <span
                                    class="label-text font-bold text-success flex items-center gap-1.5"
                                >
                                    <Icon
                                        name="lucide:wrench"
                                        class="w-4 h-4"
                                    />
                                    Resolución de la Avería / Acciones mecánicas
                                </span>
                            </label>
                            <textarea
                                v-model="form.repair"
                                rows="4"
                                placeholder="Describe qué piezas has sustituido, materiales consumidos o pruebas realizadas..."
                                class="textarea textarea-bordered border-success/40 focus:border-success w-full text-base"
                                :disabled="saving"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div
                    class="flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
                    :class="
                        form.active
                            ? 'bg-warning/10 border-warning/30'
                            : 'bg-success/10 border-success/30'
                    "
                >
                    <div class="pr-4">
                        <h3
                            class="font-bold text-sm flex items-center gap-2"
                            :class="
                                form.active
                                    ? 'text-warning-content'
                                    : 'text-success-content'
                            "
                        >
                            <Icon
                                :name="
                                    form.active
                                        ? 'lucide:alert-circle'
                                        : 'lucide:check-circle-2'
                                "
                                class="w-4 h-4 shrink-0"
                            />
                            {{
                                form.active
                                    ? "El parte sigue ABIERTO (Vehículo en reparación)"
                                    : "Avería COMPLETADA (Vehículo reparado y cerrado)"
                            }}
                        </h3>
                        <p class="text-xs opacity-75 mt-0.5">
                            Usa el interruptor de la derecha para liberar la
                            máquina o dejarla retenida en el taller.
                        </p>
                    </div>
                    <div class="form-control shrink-0">
                        <label class="label cursor-pointer p-0">
                            <input
                                v-model="form.active"
                                type="checkbox"
                                class="toggle toggle-md"
                                :class="
                                    form.active
                                        ? 'toggle-warning'
                                        : 'toggle-success'
                                "
                                :disabled="saving"
                            />
                        </label>
                    </div>
                </div>

                <div class="card-actions justify-end mt-4 gap-2">
                    <NuxtLink
                        to="/dash/averias"
                        class="btn btn-ghost"
                        :disabled="saving"
                        >Cancelar</NuxtLink
                    >
                    <button
                        type="submit"
                        class="btn btn-primary px-8"
                        :disabled="saving"
                    >
                        <span
                            v-if="saving"
                            class="loading loading-spinner loading-sm"
                        ></span>
                        {{ saving ? "Guardando..." : "Guardar Cambios" }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
