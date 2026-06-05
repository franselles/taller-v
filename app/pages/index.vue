<script setup lang="ts">
const code = ref("");

const handleLogin = async () => {
    if (code.value.length < 4) {
        return;
    }

    try {
        await $fetch("/api/login", {
            method: "POST",
            body: { code: code.value },
        });

        navigateTo("/dash");
    } catch (err: any) {
        code.value = "";
    }
};
</script>

<template>
    <div class="flex flex-1 items-center justify-center bg-base-200 p-4">
        <div
            class="card bg-base-100 w-full max-w-sm shadow-md border border-base-300"
        >
            <div class="card-body">
                <h2
                    class="card-title text-2xl font-bold justify-center mb-2 text-primary"
                >
                    GESTION DE TALLER
                </h2>
                <h3
                    class="card-title text-2xl font-bold justify-center mb-2 text-primary"
                >
                    v 0.0.1 en desarrollo
                </h3>
                <p class="text-sm text-base-content/70 text-center mb-4">
                    Introduce tus credenciales para acceder a la plataforma.
                </p>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium p-2"
                                >CODIGO ACCESO</span
                            >
                        </label>
                        <input
                            v-model="code"
                            type="password"
                            placeholder="••••"
                            class="input input-bordered w-full"
                            required
                        />
                    </div>

                    <div class="card-actions mt-6">
                        <button type="submit" class="btn btn-primary w-full">
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
