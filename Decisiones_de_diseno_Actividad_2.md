# Decisiones de diseño — Actividad 2

## Identificación

- **Actividad:** Pruebas unitarias, hooks y componentes en Task Manager
- **Proyecto:** Task Manager (Expo + React Native)
- **Repositorio (fork personal):** https://github.com/Manzano-145/task-manager-testing-lab.git
- **Rama:** `actividad-2-pruebas`

## Alcance de las pruebas

### Funciones puras (12 pruebas)

| Función | Archivo de prueba | Casos |
|---|---|---|
| `validateTaskTitle` | `__tests__/utils/validateTask.test.ts` | Títulos válidos, vacíos, espacios, longitud mínima/máxima |
| `filterTasksByStatus` | `__tests__/utils/filterTasks.test.ts` | pending, completed, all, archived, estado inválido |
| `createTaskFromTitle` | `__tests__/utils/createTaskFromTitle.test.ts` | Creación, trim, título vacío, id inválido |

### Hook (4 pruebas)

| Hook | Archivo | Comportamientos |
|---|---|---|
| `useCreateTask` | `__tests__/hooks/useCreateTask.test.ts` | Estado inicial, submit exitoso, error, removeTask |

### Componentes (8+ pruebas)

| Componente | Archivo | Comportamientos |
|---|---|---|
| `TaskForm` | `__tests__/components/TaskForm.test.tsx` | Render, changeText, submit válido, vacío, espacios |
| `TaskCard` | `__tests__/components/TaskCard.test.tsx` | Título, estados, onDelete |

## Selección de casos

- **Casos normales:** títulos válidos, filtrado por estado, creación de tareas.
- **Casos límite:** cadenas vacías, solo espacios, listas vacías, títulos > 100 caracteres.
- **Valores inesperados:** filtros inválidos (`toThrow`), identificadores vacíos.
- **Estados condicionales:** tarea pendiente vs completada en TaskCard.
- **Interacciones:** `fireEvent.press`, `fireEvent.changeText`, callbacks con `jest.fn()`.

## Mocking

| Dependencia | Motivo |
|---|---|
| `taskService.createTask` | Aislar el hook de la red; verificar transiciones de estado |
| `jest.fn()` en callbacks | Observar interacciones sin ejecutar lógica del padre |
| MSW (`src/mocks/`) | Simular API en pruebas de contrato e integración |

## Resultados

Ejecutar localmente:

```bash
npm test -- --runInBand
npx jest --coverage --runInBand
```

La suite incluye pruebas unitarias, de hooks, componentes, integración, contrato y accesibilidad.
