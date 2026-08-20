# Actividad 4 — Contenido para el PDF de entrega

Formato requerido del PDF: **máximo 4 páginas, Arial 12pt, interlineado 1.5**.

---

## 0. Datos generales

- **Estudiante:** Joan Sebastian Correa M
- **Repositorio del proyecto:** https://github.com/Manzano-145/task-manager-testing-lab
- **Rama evaluada:** `actividad-4-qa`
- **Enlace directo a la rama:** https://github.com/Manzano-145/task-manager-testing-lab/tree/actividad-4-qa
- **Stack:** React Native (Expo SDK 57) + Jest + Zod + GitHub Actions

**Nota de transparencia:** el repositorio base del docente ya incluía scaffolding relacionado con esta actividad (`src/schemas/taskSchema.ts`, un primer test de contrato en `__tests__/contract/taskApi.contract.test.ts` y `.github/workflows/tests.yml`), verificado con `git log` (intactos desde el commit inicial). Este informe documenta explícitamente qué se reutilizó tal cual y qué se agregó como trabajo propio de esta entrega.

---

## 1. Análisis de rendimiento

Medido sobre el AVD `ACTIVIDAD_4` (Android Studio), build debug generado con `npx expo run:android`, usando `adb` directo (sin herramientas de terceros).

| Métrica | Método | Resultado |
|---|---|---|
| Tiempo de arranque en frío | `adb shell am start -W` tras `am force-stop`, 3 corridas | 1232 ms / 1173 ms / 1176 ms → **promedio 1.19 s** |
| Uso de memoria (PSS) | `adb shell dumpsys meminfo com.taskmanager.app` tras carga inicial | **~121 MB** (TOTAL PSS: 123 919 KB; Native Heap 10.5 MB, Dalvik Heap 6.1 MB) |

**Cuello de botella identificado:** 1.19 s de arranque y ~121 MB de PSS son altos para una app de listas/CRUD tan simple. Ambos números corresponden a un **build debug** (Hermes sin bytecode precompilado, dev menu y conexión a Metro activos), que es conocido por inflar tiempo de arranque y memoria frente a un build de producción.

**Propuesta de mejora:** repetir la medición sobre un build **release** (`npx expo run:android --variant release`), donde Hermes precompila el bytecode y se elimina el overhead del dev menu/Metro — es la comparación que permite saber cuánto del costo actual es real y cuánto es artefacto del entorno de desarrollo.

---

## 2. Análisis de seguridad — OWASP Mobile Top 10

Revisión de código real sobre `src/`, sin herramientas externas (MobSF/ZAP no configuradas en esta pasada).

| # | Punto OWASP | ¿Cumple? | Hallazgo | Corrección propuesta / aplicada |
|---|---|---|---|---|
| 1 | **M4 – Insufficient Input/Output Validation** | ❌ No cumplía | `src/services/taskService.ts` hacía `res.json()` y confiaba ciegamente en el shape de la respuesta, pese a existir `TaskSchema`/`TaskListSchema` sin usar en runtime. | **Corregido en esta entrega:** `fetchTasks`/`createTask` ahora parsean la respuesta con `.parse()` de Zod y rechazan si no cumple el contrato (ver sección 3). |
| 2 | **M5 – Insecure Communication** | ⚠️ Parcial | `API_URL` usa HTTPS hardcoded (correcto), pero no hay `AbortController`/timeout ni política ATS explícita (`NSAppTransportSecurity`) en `app.json`. | Agregar `AbortController` con timeout en `taskService.ts` y declarar ATS explícito si se distribuye a producción. |
| 3 | **M9 – Insecure Data Storage** | ✅ No aplica | No hay `AsyncStorage`/`SecureStore` ni persistencia local — el estado vive solo en memoria de React (confirmado por búsqueda en todo `src/`). | Sin acción; si se agrega persistencia a futuro, usar `expo-secure-store` para cualquier dato sensible. |
| 4 | **M2 – Inadequate Supply Chain Security** (extra) | ❌ No cumplía | `npm audit` real: **25 vulnerabilidades (7 moderate, 18 high)**, concentradas en dependencias de tooling de Expo (`@expo/config-plugins` y derivados). | Planificar `npm audit fix` y revisar breaking changes antes de aplicar `--force`. |

---

## 3. Pruebas de contrato de API con Zod

`src/schemas/taskSchema.ts` (ya existente, reutilizado sin cambios) define `TaskSchema` (id, title, status: `'pending'|'completed'`, createdAt opcional) y `TaskListSchema`.

**Aporte de esta entrega:** se cableó ese esquema en `taskService.ts` (sección 2, hallazgo M4) y se agregaron 4 pruebas nuevas en `__tests__/contract/taskApi.contract.test.ts` que validan el comportamiento real del servicio (mockeado con MSW, mismo patrón que usa el resto del proyecto), no solo datos sueltos:

| # | Prueba | Qué verifica |
|---|---|---|
| 1 | `fetchTasks()` con respuesta válida | Resuelve con los datos cuando la respuesta cumple el contrato. |
| 2 | `fetchTasks()` con respuesta inválida (sin `title`) | Rechaza (`rejects.toThrow`) en vez de propagar datos corruptos. |
| 3 | `createTask()` con respuesta válida | Resuelve con la tarea creada cuando cumple el contrato. |
| 4 | `createTask()` con `status` fuera del enum (`'archived'`) | Rechaza — el enum de Zod bloquea valores no contemplados. |

Suite completa: **64 pruebas, 15 suites, todas en verde**; cobertura global 94.17% statements / 93.61% branches / 90% funciones / 95.29% líneas (umbral mínimo: 70% en las 4 métricas, `jest.config.js`).

---

## 4. Pipeline de integración continua

`.github/workflows/tests.yml` (ya existía con un job básico de test; extendido en esta entrega):

- **Trigger ampliado:** además de `main`/`develop`, ahora también dispara con `push` a cualquier rama `actividad-**`, para poder evidenciar cada entrega con una corrida real.
- **Step de lint agregado:** `npx eslint .` corre antes de los tests y hace fallar el job si hay errores.
- **Reporte de cobertura como artifact:** `actions/upload-artifact@v4` publica el directorio `coverage/` generado por `jest --coverage` en cada corrida.
- **Umbral de cobertura:** ya configurado en `jest.config.js` (`coverageThreshold.global`: 70% branches/functions/lines/statements) — Jest hace fallar el job nativamente si no se cumple; no se reimplementó, se verificó que funciona.

Evidencia de ejecución exitosa adjunta como captura de pantalla (`evidencias/github-actions-run.png`), correspondiente al push de la rama `actividad-4-qa`.

---

## 5. Conclusión

Esta entrega cubre los cuatro frentes pedidos: rendimiento medido con datos reales de `adb` (arranque y memoria) con un cuello de botella identificado (overhead de build debug) y su propuesta de verificación en release; seguridad revisada contra 4 puntos de OWASP Mobile Top 10 con una corrección real aplicada (M4) y hallazgos honestos donde no aplicaba (M9); contrato de API reforzado con validación runtime real y 4 pruebas nuevas contra el servicio; y CI/CD extendido con lint, artifact de cobertura y trigger por rama de actividad, evidenciado con una corrida real en GitHub Actions.
