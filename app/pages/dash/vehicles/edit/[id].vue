<script setup lang="ts">
// Forzar el layout del dashboard
definePageMeta({
    layout: "dash",
});

// 1. Obtener el ID del vehículo desde los parámetros de la URL
const route = useRoute();
const vehicleId = route.params.id;

// Estado del formulario
const form = ref({
    model: "",
    plate: "",
    km: null as number | null,
    oil_km: null as number | null,
    next_oil_km: null as number | null,
    itv_date: "",
    next_itv_date: "",
    active: true,
});

const saving = ref(false);
const statusMessage = ref<{ type: "success" | "error"; text: string } | null>(
    null,
);

// 2. Cargar los datos actuales del vehículo usando useFetch al montar la página
// Asume un endpoint GET en /api/vehicles/[id] o similar. Ajusta la URL según tu API.
const {
    data: currentVehicle,
    pending: loadingVehicle,
    error: loadError,
} = await useFetch<any>(`/api/vehicle/${vehicleId}`);

// Cuando los datos carguen con éxito, los volcamos en el formulario reactivo
watch(
    currentVehicle,
    (newData) => {
        if (newData) {
            form.value = {
                model: newData.model || "",
                plate: newData.plate || "",
                km: newData.km,
                oil_km: newData.oil_km,
                next_oil_km: newData.next_oil_km,
                // Formateamos las fechas de la BD (ISO String) al formato requerido por el input "date" (YYYY-MM-DD)
                itv_date: newData.itv_date
                    ? newData.itv_date.split("T")[0]
                    : "",
                next_itv_date: newData.next_itv_date
                    ? newData.next_itv_date.split("T")[0]
                    : "",
                active: newData.active ?? true,
            };
        }
    },
    { immediate: true },
);

// 3. Enviar los datos modificados mediante PUT
const handleSubmit = async () => {
    saving.value = true;
    statusMessage.value = null;

    try {
        await $fetch(`/api/vehicle`, {
            // Tu endpoint PUT que acepta el cuerpo de actualización
            method: "PUT",
            body: {
                id: Number(vehicleId), // Le pasamos el ID obligatorio para el WHERE de Prisma
                model: form.value.model,
                plate: form.value.plate,
                km: form.value.km,
                oil_km: form.value.oil_km,
                next_oil_km: form.value.next_oil_km,
                itv_date: form.value.itv_date || null,
                next_itv_date: form.value.next_itv_date || null,
                active: form.value.active,
            },
        });

        statusMessage.value = {
            type: "success",
            text: "Los cambios del vehículo se han guardado correctamente.",
        };

        // Redirigir de vuelta a la lista tras 1.5 segundos
        setTimeout(() => {
            navigateTo("/dash/vehicles");
        }, 1500);
    } catch (error: any) {
        console.error("Error al actualizar:", error);
        statusMessage.value = {
            type: "error",
            text:
                error.statusMessage ||
                "No se pudo actualizar el vehículo. Revisa los datos.",
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
                    Editar Vehículo
                </h1>
                <p class="text-sm text-base-content/60">
                    Modifica los detalles técnicos o el estado operativo de la
                    máquina.
                </p>
            </div>
            <NuxtLink to="/dash/vehicles" class="btn btn-ghost btn-sm gap-2">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Volver al listado
            </NuxtLink>
        </div>

        <div
            v-if="loadingVehicle"
            class="flex flex-col items-center justify-center py-12 bg-base-100 rounded-xl border border-base-300 shadow-sm"
        >
            <span
                class="loading loading-spinner loading-lg text-primary mb-3"
            ></span>
            <p class="text-sm font-medium text-base-content/70">
                Recuperando ficha técnica del vehículo...
            </p>
        </div>

        <div
            v-else-if="loadError"
            class="alert alert-error shadow-sm text-error-content"
        >
            <Icon name="lucide:triangle-alert" class="w-5 h-5 shrink-0" />
            <span
                >Error al cargar los datos del vehículo. Puede que no exista en
                el sistema.</span
            >
        </div>

        <div v-else class="card bg-base-100 shadow-sm border border-base-300">
            <form @submit.prevent="handleSubmit" class="card-body gap-6">
                <div
                    v-if="statusMessage"
                    class="alert shadow-sm"
                    :class="
                        statusMessage.type === 'success'
                            ? 'alert-success text-success-content'
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

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Información Básica
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Modelo / Descripción</span
                                ></label
                            >
                            <input
                                v-model="form.model"
                                type="text"
                                class="input input-bordered w-full"
                                required
                                :disabled="saving"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Matrícula / Identificador</span
                                ></label
                            >
                            <input
                                v-model="form.plate"
                                type="text"
                                class="input input-bordered w-full uppercase"
                                required
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Kilometrajes y Mantenimiento
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Kilómetros Actuales</span
                                ></label
                            >
                            <input
                                v-model="form.km"
                                type="number"
                                class="input input-bordered w-full"
                                min="0"
                                required
                                :disabled="saving"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Km Último Aceite</span
                                ></label
                            >
                            <input
                                v-model="form.oil_km"
                                type="number"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="saving"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Km Próximo Aceite</span
                                ></label
                            >
                            <input
                                v-model="form.next_oil_km"
                                type="number"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Inspección Técnica (ITV)
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Fecha Última ITV</span
                                ></label
                            >
                            <input
                                v-model="form.itv_date"
                                type="date"
                                class="input input-bordered w-full"
                                :disabled="saving"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Fecha Próxima ITV</span
                                ></label
                            >
                            <input
                                v-model="form.next_itv_date"
                                type="date"
                                class="input input-bordered w-full"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div
                    class="flex items-center justify-between bg-base-200 p-4 rounded-xl"
                >
                    <div>
                        <h3 class="font-medium text-sm">Estado del Vehículo</h3>
                        <p class="text-xs text-base-content/60">
                            Cambia el estado si la máquina entra en reparación o
                            parada técnica.
                        </p>
                    </div>
                    <div class="form-control">
                        <label class="label cursor-pointer gap-3">
                            <span class="label-text font-medium">{{
                                form.active
                                    ? "Activo / Operativo"
                                    : "Inactivo / Parado"
                            }}</span>
                            <input
                                v-model="form.active"
                                type="checkbox"
                                class="toggle toggle-primary"
                                :disabled="saving"
                            />
                        </label>
                    </div>
                </div>

                <div class="card-actions justify-end mt-4 gap-2">
                    <NuxtLink to="/dash/vehicles" class="btn btn-ghost"
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
