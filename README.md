# 🏗️ Portal de Obras - Plataforma de Gestión y Visualización de Infraestructura

> **Tech Lead Senior Architecture Blueprint & Scaffold**  
> Aplicación web empresarial desarrollada con **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **NextAuth / Auth.js** y conector de alta concurrencia a **Google Sheets API v4**.

---

## 📋 Tabla de Contenidos
1. [Visión General y Arquitectura](#-visión-general-y-arquitectura)
2. [Estructura de Carpetas del Proyecto](#-estructura-de-carpetas-del-proyecto)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Instalación y Puesta en Marcha Local](#-instalación-y-puesta-en-marcha-local)
5. [Configuración de Google Sheets API v4](#-configuración-de-google-sheets-api-v4)
6. [Módulo de Autenticación y ABM de Usuarios](#-módulo-de-autenticación-y-abm-de-usuarios)
7. [Estrategia de Cacheo en Servidor (Data Cache)](#-estrategia-de-cacheo-en-servidor-data-cache)
8. [Despliegue Continuo en Vercel](#-despliegue-continuo-en-vercel)

---

## 🏛️ Visión General y Arquitectura

El **Portal de Obras** permite centralizar y fiscalizar el avance físico y financiero de obras públicas y privadas a partir de múltiples planillas de Google Sheets administradas por diferentes áreas operativas (inspección de obra, certificaciones contables y registro de contratistas).

### Principios de Diseño:
- **Clean Architecture & Server-First:** La mayor parte del procesamiento de datos, autenticación y consultas a Google Sheets ocurre en Server Components, reduciendo el bundle del cliente al mínimo.
- **Resiliencia & Rate Limiting Prevention:** Uso del **Next.js Data Cache** (`unstable_cache`) con revalidación configurable (por defecto 300s) y revalidación por tags (`google-sheets-data`) para evitar agotar las cuotas de Google Sheets API v4 (300 requests por minuto por proyecto).
- **Graceful Fallback:** Si las credenciales de Google Service Account no están cargadas o hay un corte de red, el sistema recurre de forma transparente a datos de contingencia corporativos (*mock seed data*), evitando pantallas rotas en demos o etapas tempranas de desarrollo.
- **UI Sobria y Accesible:** Paleta neutra (`#F8FAFC`, `#FFFFFF`, acentos corporativos en slate/navy), tipografía institucional **Montserrat** cargada vía `next/font/google`, componentes accesibles modulares (estilo shadcn/ui) e iconos optimizados con **Lucide React**.

---

## 📂 Estructura de Carpetas del Proyecto

```text
tablero-de-obra/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # Endpoint handler de NextAuth (JWT)
│   ├── dashboard/
│   │   ├── layout.tsx                # Layout con Sidebar retráctil y Navbar
│   │   ├── page.tsx                  # Dashboard principal (KPIs, Gráficos, Alertas)
│   │   ├── obras/
│   │   │   └── page.tsx              # Vista de listado maestro de obras
│   │   ├── contratistas/
│   │   │   └── page.tsx              # Padrón de contratistas y habilitaciones
│   │   ├── certificaciones/
│   │   │   └── page.tsx              # Actas y certificados mensuales
│   │   └── usuarios/
│   │       └── page.tsx              # Módulo ABM de usuarios (Solo ADMIN)
│   ├── login/
│   │   └── page.tsx                  # Pantalla de acceso Split-Screen
│   ├── globals.css                   # Estilos Tailwind y variables de diseño
│   ├── layout.tsx                    # Root Layout con fuente Montserrat
│   └── page.tsx                      # Redirección automática a /login o /dashboard
│
├── components/
│   ├── dashboard/
│   │   ├── navbar.tsx                # Barra superior (perfil, logout, sync, filtro)
│   │   └── sidebar.tsx               # Barra lateral retráctil con filtro por rol
│   └── ui/                           # Componentes atómicos modulares (shadcn-style)
│       ├── badge.tsx                 # Badges con variantes de severidad (Alta/Media/Baja)
│       ├── button.tsx                # Botón con estados de carga y variantes
│       ├── card.tsx                  # Contenedores de KPIs y gráficos
│       └── input.tsx                 # Inputs de formulario accesibles
│
├── lib/
│   ├── auth.ts                       # Configuración y callbacks de NextAuth
│   ├── google-sheets.ts              # Conector Google Sheets v4 con Server Cache
│   ├── users.ts                      # Persistencia / ABM de usuarios y hashing
│   └── utils.ts                      # Clases cn(), formateo de moneda y fechas
│
├── types/
│   ├── auth.ts                       # Definición de sesión, JWT y roles
│   ├── sheets.ts                     # Interfaces de Obras, Contratistas, Alertas, KPIs
│   └── user.ts                       # Modelos para ABM de usuarios
│
├── middleware.ts                     # Protección de rutas /dashboard y control ADMIN
├── .env.example                      # Especificación completa de variables de entorno
├── .gitignore                        # Reglas Git estándar
├── next.config.mjs                   # Configuración del compilador Next.js
├── package.json                      # Dependencias y scripts
├── postcss.config.mjs                # Pipeline de PostCSS
├── tailwind.config.ts                # Tema institucional corporativo y fuentes
└── tsconfig.json                     # Reglas TypeScript estrictas y alias @/*
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components para caching nativo, rendimiento de carga instantáneo y SEO/SSR. |
| **Lenguaje** | TypeScript 5 | Tipado estático riguroso de esquemas de planillas y permisos. |
| **Estilos** | Tailwind CSS 3.4 | Sistema de diseño ágil, tipografía **Montserrat** y fondos `#F8FAFC` / `#FFFFFF`. |
| **Iconografía** | Lucide React | Iconos vectoriales corporativos ligeros y accesibles. |
| **Autenticación** | NextAuth.js (Auth.js) | Manejo de sesiones basadas en JWT seguras (8hs) y control de roles (`ADMIN` / `OPERADOR`). |
| **Integración** | Google APIs (`googleapis`) | Conexión a Google Sheets v4 con credenciales delegadas de Service Account. |
| **Despliegue** | Vercel | Optimizado para Edge Caching, Serverless Functions y Git CI/CD. |

---

## 🚀 Instalación y Puesta en Marcha Local

### 1. Requisitos Previos
- **Node.js**: v18.17+ o v20 LTS.
- **npm**, **pnpm** o **yarn**.

### 2. Clonar e Instalar Dependencias
```bash
# Instalar dependencias declaradas en package.json
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo de ejemplo a `.env.local`:
```bash
cp .env.example .env.local
```
Completa las credenciales requeridas. Si aún no tienes la Service Account de Google, puedes iniciar la aplicación y utilizará automáticamente el set de datos de prueba corporativo.

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📊 Configuración de Google Sheets API v4

### Paso a Paso para la Service Account:
1. En **Google Cloud Console**, crea un proyecto (ej: `portal-de-obras-prod`).
2. Habilita la **Google Sheets API v4**.
3. En **IAM & Admin > Service Accounts**, crea una cuenta de servicio (ej: `sheets-reader@portal-de-obras-prod.iam.gserviceaccount.com`).
4. Genera una nueva **clave en formato JSON** y descárgala.
5. Copia el correo de la cuenta de servicio y dale permisos de **"Lector" (Viewer)** a las hojas de cálculo de Google Drive correspondientes.
6. En tu `.env.local`, asigna:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-reader@...
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Estructura de Columnas Esperada en Google Sheets:
- **Pestaña `Obras`**:
  `ID | Código | Nombre | Tipología | Ubicación | ContratistaId | ContratistaNombre | PresupuestoOficial | MontoContratado | MontoCertificado | AvanceFisico | AvanceFinanciero | FechaInicio | FechaFinEstimada | Estado | Inspector`
- **Pestaña `Contratistas`**:
  `ID | CUIT | Razón Social | Representante Técnico | Email | Teléfono | ObrasActivas | Estado`
- **Pestaña `Certificaciones`**:
  `ID | NroCertificado | ObraId | Periodo | Monto | AvanceMes | FechaPresentacion | Estado`

---

## 🔐 Módulo de Autenticación y ABM de Usuarios

El sistema incluye autenticación segura mediante **JWT** con roles definidos:

### 1. Roles Disponibles
- **`ADMIN`:** Acceso total al Dashboard, visualización de obras, contratistas, certificaciones y acceso exclusivo al módulo **ABM de Usuarios** (`/dashboard/usuarios`).
- **`OPERADOR`:** Acceso de consulta y fiscalización técnica. El módulo de usuarios no aparece en su Sidebar y las peticiones directas a `/dashboard/usuarios` son bloqueadas a nivel de red por el `middleware.ts`.

### 2. Cuentas de Acceso Preconfiguradas (Demo / Fase 1)
| Rol | Correo Electrónico | Contraseña | Perfil |
|---|---|---|---|
| **ADMIN** | `admin@portaldeobras.gob.ar` | `Admin1234!` | Arq. Valeria Domínguez (Directora General) |
| **OPERADOR** | `operador@portaldeobras.gob.ar` | `Operador1234!` | Ing. Martín Morales (Inspector Técnico) |

*(Nota: En la pantalla de login `/login` dispones de botones de acceso rápido de prueba para rellenar automáticamente estas credenciales).*

---

## ⚡ Estrategia de Cacheo en Servidor (Data Cache)

Google Sheets API v4 impone un límite de **300 peticiones por minuto por proyecto**. Para permitir cientos de usuarios concurrentes sin degradar la aplicación ni incurrir en bloqueos por cuota:

1. **`unstable_cache` de Next.js:** Todas las funciones (`getObras`, `getContratistas`, `getAlertas`, `getDashboardMetrics`) encapsulan la llamada externa dentro de una capa de cache persistente en servidor.
2. **Revalidación Configurable:** Mediante la variable `SHEETS_CACHE_REVALIDATE_SECONDS` (por defecto `300` segundos = 5 minutos).
3. **Tags de Invalidation:** Las consultas están marcadas con el tag `google-sheets-data`, permitiendo forzar una sincronización inmediata desde el botón del Navbar o mediante un webhook de Google Apps Script.

---

## 🌐 Despliegue Continuo en Vercel

1. Sube el código a tu repositorio (GitHub, GitLab o Bitbucket).
2. Conecta el repositorio en el panel de **Vercel**.
3. En la sección **Environment Variables** del proyecto en Vercel, copia todas las variables del `.env.example`:
   - `NEXTAUTH_URL`: La URL de tu dominio en producción (ej: `https://portal-de-obras.vercel.app`).
   - `NEXTAUTH_SECRET`: Generado con `openssl rand -base64 32`.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` *(Vercel soporta saltos de línea literales en su formulario de variables secretas)*.
   - `SHEETS_CONFIG` o IDs individuales de planillas.
4. Presiona **Deploy**. El pipeline de Vercel compilará la aplicación con optimización estática y SSR automático.
