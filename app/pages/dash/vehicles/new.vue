<script setup lang="ts">
// Definir el layout del dashboard para que mantenga el menú lateral
definePageMeta({
    layout: "dash", // Asegúrate de que tu archivo de layout en layouts/ se llame dash.vue
});

// Estado del formulario mapeado exactamente a tu endpoint
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

const loading = ref(false);
const statusMessage = ref<{ type: "success" | "error"; text: string } | null>(
    null,
);

const handleSubmit = async () => {
    loading.value = true;
    statusMessage.value = null;

    try {
        // Petición al endpoint que acabas de definir
        await $fetch("/api/vehicle", {
            // Ajusta la URL exacta de tu endpoint si cambia
            method: "POST",
            body: {
                model: form.value.model,
                plate: form.value.plate,
                km: form.value.km,
                itv_date: form.value.itv_date || null,
                next_itv_date: form.value.next_itv_date || null,
                oil_km: form.value.oil_km,
                next_oil_km: form.value.next_oil_km,
                active: form.value.active,
            },
        });

        statusMessage.value = {
            type: "success",
            text: "Vehículo registrado correctamente en el sistema.",
        };

        // Limpiar el formulario tras el éxito
        form.value = {
            model: "",
            plate: "",
            km: null,
            oil_km: null,
            next_oil_km: null,
            itv_date: "",
            next_itv_date: "",
            active: true,
        };

        // Opcional: Redirigir a la lista de vehículos tras 2 segundos
        setTimeout(() => {
            navigateTo("/dash/vehicles");
        }, 2000);
    } catch (error: any) {
        statusMessage.value = {
            type: "error",
            text:
                error.statusMessage ||
                "Hubo un error al guardar el vehículo. Inténtalo de nuevo.",
        };
    } finally {
        loading.value = false;
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
                    Nuevo Vehículo
                </h1>
                <p class="text-sm text-base-content/60">
                    Da de alta una nueva máquina o vehículo en el taller.
                </p>
            </div>
            <NuxtLink to="/dash/vehiculos" class="btn btn-ghost btn-sm gap-2">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Volver al listado
            </NuxtLink>
        </div>

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

        <div class="card bg-base-100 shadow-sm border border-base-300">
            <form @submit.prevent="handleSubmit" class="card-body gap-6">
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
                                placeholder="Ej: BMW R1200R, Camión Limpieza..."
                                class="input input-bordered w-full"
                                required
                                :disabled="loading"
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
                                placeholder="Ej: 1234XYZ"
                                class="input input-bordered w-full uppercase"
                                required
                                :disabled="loading"
                            />
                        </div>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <div>
                    <h2
                        class="text-md font-semibold text-primary uppercase tracking-wider mb-3"
                    >
                        Kilometrajes y Control de Aceite
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
                                placeholder="0"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="loading"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Km Último Cambio Aceite</span
                                ></label
                            >
                            <input
                                v-model="form.oil_km"
                                type="number"
                                placeholder="0"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="loading"
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label"
                                ><span class="label-text font-medium"
                                    >Km Próximo Cambio Aceite</span
                                ></label
                            >
                            <input
                                v-model="form.next_oil_km"
                                type="number"
                                placeholder="0"
                                class="input input-bordered w-full"
                                min="0"
                                :disabled="loading"
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
                                :disabled="loading"
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
                                :disabled="loading"
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
                            Determina si el vehículo está actualmente operativo
                            o parado.
                        </p>
                    </div>
                    <div class="form-control">
                        <label class="label cursor-pointer gap-3">
                            <span class="label-text font-medium">{{
                                form.active ? "Activo" : "Inactivo"
                            }}</span>
                            <input
                                v-model="form.active"
                                type="checkbox"
                                class="toggle toggle-primary"
                                :disabled="loading"
                            />
                        </label>
                    </div>
                </div>

                <div class="card-actions justify-end mt-4 gap-2">
                    <NuxtLink
                        to="/dash/vehiculos"
                        class="btn btn-ghost"
                        :disabled="loading"
                        >Cancelar</NuxtLink
                    >
                    <button
                        type="submit"
                        class="btn btn-primary px-8"
                        :disabled="loading"
                    >
                        <span
                            v-if="loading"
                            class="loading loading-spinner loading-sm"
                        ></span>
                        {{ loading ? "Guardando..." : "Registrar Vehículo" }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
