<script setup lang="ts">
// Forzar el layout del dashboard
definePageMeta({
    layout: "dash",
});

// Interfaces básicas para el tipado
interface VehicleMin {
    id: number;
    model: string | null;
    plate: string | null;
    km: number | null;
}

// 1. Cargamos los vehículos para el desplegable (solo los activos)
const { data: vehicles, pending: loadingVehicles } =
    await useFetch<VehicleMin[]>("/api/vehicles");

// Estado del formulario de la avería
const form = ref({
    date_report: new Date().toISOString().split("T")[0], // Por defecto, el día de hoy
    vehicle_id: "" as number | string,
    km: null as number | null,
    fault: "",
    repair: "", // Puede empezar vacío ya que a veces solo se reporta el fallo
    active: true, // El parte empieza abierto por defecto
});

const saving = ref(false);
const statusMessage = ref<{ type: "success" | "error"; text: string } | null>(
    null,
);

// 2. Observador inteligente: cuando eligen un coche, sugerimos sus kilómetros actuales
watch(
    () => form.value.vehicle_id,
    (newVehicleId) => {
        if (newVehicleId && vehicles.value) {
            const selected = vehicles.value.find(
                (v) => v.id === Number(newVehicleId),
            );
            if (selected && selected.km) {
                form.value.km = selected.km;
            }
        }
    },
);

// 3. Enviar el nuevo informe al servidor (POST)
const handleSubmit = async () => {
    if (!form.value.vehicle_id) {
        statusMessage.value = {
            type: "error",
            text: "Por favor, selecciona un vehículo.",
        };
        return;
    }

    saving.value = true;
    statusMessage.value = null;

    try {
        // ✨ Capturamos la respuesta del servidor (que contiene el ID recién creado)
        const newReportResult = await $fetch<any>("/api/report", {
            method: "POST",
            body: {
                date_report: form.value.date_report
                    ? new Date(form.value.date_report)
                    : null,
                vehicle_id: Number(form.value.vehicle_id),
                km: form.value.km ? Number(form.value.km) : null,
                fault: form.value.fault,
                repair: form.value.repair || null,
                active: form.value.active,
            },
        });

        // ✨ Mostramos el ID en el mensaje de éxito de la pantalla
        statusMessage.value = {
            type: "success",
            text: `Parte guardado con éxito. SE HA ASIGNADO EL NÚMERO DE PARTE: #${newReportResult.id}`,
        };

        // Le damos un poco más de tiempo (3 segundos) para que pueda copiarlo en el papel antes de cambiar de página
        setTimeout(() => {
            navigateTo("/dash/reports");
        }, 3000);
    } catch (error: any) {
        console.error("Error creando reporte:", error);
        statusMessage.value = {
            type: "error",
            text:
                error.statusMessage ||
                "Hubo un problema al guardar el informe.",
        };
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <div
            class="flex items-center justify-between border-b border-base-300 pb-4"
        >
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-base-content">
                    Nuevo Parte de Avería
                </h1>
                <p class="text-sm text-base-content/60">
                    Abre una incidencia técnica para realizar el seguimiento de
                    una reparación.
                </p>
            </div>
            <NuxtLink to="/dash/reports" class="btn btn-ghost btn-sm gap-2">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Volver al listado
            </NuxtLink>
        </div>

        <div
            v-if="statusMessage"
            class="alert shadow-sm text-md"
            :class="
                statusMessage.type === 'success'
                    ? 'alert-success text-success-content font-bold bg-success/20 border-success'
                    : 'alert-error text-error-content'
            "
        >
            <Icon
                :name="
                    statusMessage.type === 'success'
                        ? 'lucide:file-text'
                        : 'lucide:triangle-alert'
                "
                class="w-6 h-6 shrink-0"
            />
            <span>{{ statusMessage.text }}</span>
        </div>

        <div class="card bg-base-100 shadow-sm border border-base-300">
            <form @submit.prevent="handleSubmit" class="card-body gap-6">
                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Asignación y Fecha
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Fecha del Reporte</span
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

                        <div class="form-control w-full md:col-span-2">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Vehículo Afectado</span
                                ></label
                            >
                            <select
                                v-model="form.vehicle_id"
                                class="select select-bordered w-full"
                                required
                                :disabled="loadingVehicles || saving"
                            >
                                <option value="" disabled selected>
                                    Selecciona un vehículo de la flota...
                                </option>
                                <option
                                    v-for="vehicle in vehicles"
                                    :key="vehicle.id"
                                    :value="vehicle.id"
                                >
                                    {{ vehicle.model }} — [
                                    {{ vehicle.plate }} ]
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Estado del Motor
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text font-medium"
                                    >Kilómetros en el momento del fallo</span
                                >
                            </label>
                            <input
                                v-model="form.km"
                                type="number"
                                placeholder="Ej: 142000"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="saving"
                            />
                            <label class="label">
                                <span
                                    class="label-text-alt text-base-content/50"
                                    >Se autocompleta con el último kilometraje
                                    registrado del vehículo.</span
                                >
                            </label>
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Fichas de Trabajo
                    </h2>
                    <div class="space-y-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Descripción del Fallo / Síntomas</span
                                ></label
                            >
                            <textarea
                                v-model="form.fault"
                                rows="4"
                                placeholder="Describe detalladamente qué le pasa al vehículo (Ej: Pérdida de potencia, ruido extraño en el eje delantero, testigo de aceite encendido...)"
                                class="textarea textarea-bordered w-full text-base"
                                required
                                :disabled="saving"
                            ></textarea>
                        </div>

                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text font-medium"
                                    >Acción Correctiva / Reparación</span
                                >
                                <span class="label-text-alt opacity-50"
                                    >(Opcional)</span
                                >
                            </label>
                            <textarea
                                v-model="form.repair"
                                rows="4"
                                placeholder="Si ya se ha solucionado, detalla qué piezas se han cambiado o qué reparación se ha llevado a cabo..."
                                class="textarea textarea-bordered w-full text-base"
                                :disabled="saving"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div
                    class="flex items-center justify-between bg-base-200 p-4 rounded-xl"
                >
                    <div>
                        <h3 class="font-medium text-sm">
                            Estado inicial del parte
                        </h3>
                        <p class="text-xs text-base-content/60">
                            Determina si el coche se queda retenido en el taller
                            o ya sale reparado.
                        </p>
                    </div>
                    <div class="form-control">
                        <label class="label cursor-pointer gap-3">
                            <span class="label-text font-medium">{{
                                form.active
                                    ? "🛠️ Abierto (En Taller)"
                                    : "✅ Cerrado (Reparado)"
                            }}</span>
                            <input
                                v-model="form.active"
                                type="checkbox"
                                class="toggle toggle-warning"
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
                        {{
                            saving
                                ? "Creando Parte..."
                                : "Abrir Parte de Avería"
                        }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
