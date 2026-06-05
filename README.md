# Taller V — Módulo de Gestión de Flota y Taller

Sistema en tiempo real para el control de mantenimiento y partes de averías de la flota de vehículos y maquinaria pesada de **RA Benidorm**. Este módulo digitaliza el flujo de trabajo del taller mecánico, permitiendo sustituir las hojas de papel por un registro síncrono de incidencias.

## 🚀 Tecnologías Utilizadas

* **Framework:** [Nuxt 4](https://nuxt.com/) (Full-stack SSR/SPA)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto en cliente y servidor)
* **Base de Datos:** [MariaDB](https://mariadb.org/) / MySQL
* **ORM:** [Prisma](https://www.prisma.io/) (Generación de clientes aislada en `../app/generated/prisma`)
* **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) (Componentes semánticos)
* **Iconos:** [Lucide Icons](https://lucide.dev/) (A través del módulo `@nuxt/icon`)

---

## 🗄️ Arquitectura de la Base de Datos (Prisma Schema)

El sistema se compone de tres entidades principales perfectamente relacionadas:
* **Users:** Operarios e inspectores del sistema.
* **Vehicles:** Ficha técnica de las máquinas (Modelos, matrículas, kilómetros y control de alertas de ITV/Aceite).
* **Reports:** Partes de avería vinculados a un vehículo por su `id` autoincremental (Nº de Parte físico).

## 🛠️ Copyright © 2024

R.A. Benidorm.
