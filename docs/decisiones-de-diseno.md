# Decisiones de diseño de las pruebas — Actividad 2

Estudiante: Joan Correa
Proyecto: Task Manager (Expo + React Native)
Rama: `actividad-2-pruebas`

Este documento explica qué probé, por qué elegí esos casos y qué dependencias tuve que simular. Lo escribo como parte de la entrega de la Actividad 2 (pruebas unitarias, de hooks y de componentes).

## Qué probé y por qué

Empecé por las funciones puras porque son las más fáciles de probar: no dependen de nada externo, solo reciben datos y devuelven un resultado.

- `validateTaskTitle` (`__tests__/utils/validateTask.test.ts`): valida el título de una tarea. Probé un título normal, uno vacío, uno de solo espacios, y los casos límite de longitud (3 caracteres es el mínimo permitido, 100 el máximo, así que probé justo en esos bordes y un carácter antes/después).
- `filterTasksByStatus` (`__tests__/utils/filterTasks.test.ts`): filtra tareas por estado (pendiente, completada, todas). Probé cada estado, una lista vacía, y qué pasa si se manda un estado que no existe (lanza un error).
- `createTaskFromTitle` (`__tests__/utils/createTaskFromTitle.test.ts`): crea el objeto de tarea a partir de un título. Probé la creación normal, que le quite los espacios de los extremos, y los casos de título vacío o id inválido.

Para el hook elegí `useCreateTask` (`__tests__/hooks/useCreateTask.test.ts`) porque es el que maneja todo el flujo de crear una tarea: estado inicial, éxito, error y eliminar. Usé `renderHook` para poder probar el hook sin tener que montar toda la pantalla, y `act()` para envolver las actualizaciones de estado (si no, React se queja porque no puede procesar el cambio a tiempo). También agregué pruebas para `useTaskList` y `useCounter`, que son más simples pero ayudan a cubrir otros casos de manejo de estado.

Para componentes probé `TaskForm` y `TaskCard`, que son los dos que tienen más interacción del usuario:

- `TaskForm`: que el campo de texto y el botón se rendericen, que se pueda escribir, que al presionar "Guardar" se llame a `onSubmit` con el texto correcto, y que **no** se llame si el campo está vacío o solo tiene espacios (ese es el estado condicional que pedía la actividad).
- `TaskCard`: que muestre el título, que refleje si la tarea está completada o no, y que dispare el callback correcto al tocar los botones.

Usé `render`, `screen` y `fireEvent` de React Native Testing Library, y traté de consultar los elementos por cómo los vería un usuario (texto visible, rol de botón, placeholder) en vez de depender de `testID` en todos lados.

De paso también agregué pruebas para otros componentes (`TaskList`, `StatusBadge`, `ConfirmDeleteDialog`) y un par de pruebas extra de accesibilidad e integración, para practicar un poco más con lo visto en la unidad.

## Mocking

Donde tuve que simular algo, dejé un comentario explicando por qué, como se pedía en la actividad:

- En `useCreateTask.test.ts` simulo `taskService` (`jest.mock`) para que el hook no dependa de una llamada de red real; así puedo probar los distintos estados (cargando, éxito, error) sin esperar ni depender de que un servidor responda.
- En los componentes uso `jest.fn()` para los callbacks (`onSubmit`, `onDelete`, `onConfirm`, etc.), porque lo único que me interesa verificar es que se llamen con los datos correctos, no ejecutar la lógica real de quien los use.

## Resultados

Corriendo `npx jest --coverage --runInBand`:

- 15 suites de prueba, todas pasan.
- 58 pruebas en total, todas pasan.
- Cobertura: 91.75% statements, 88.88% branches, 89.47% functions, 92.5% lines.

Con esto se cumplen los mínimos pedidos (6 pruebas unitarias, 4 de hook, 4 de componentes, con al menos 2 casos límite por función) y quedé con margen extra por si algo fallaba al revisar.

## Repositorio

https://github.com/Manzano-145/task-manager-testing-lab/tree/actividad-2-pruebas
