import { http, HttpResponse } from 'msw';
import { TaskSchema, TaskListSchema } from '../../src/schemas/taskSchema';
import { server } from '../../src/mocks/server';
import { fetchTasks, createTask } from '../../src/services/taskService';

const API_URL = 'https://api.taskmanager.com';

describe('API Contract - Tasks', () => {
  it('la respuesta de GET /tasks cumple con el esquema esperado', () => {
    const apiResponse = [
      { id: '1', title: 'Tarea 1', status: 'pending' },
      { id: '2', title: 'Tarea 2', status: 'completed' },
    ];
    const result = TaskListSchema.safeParse(apiResponse);
    expect(result.success).toBe(true);
  });

  it('detecta cuando la API devuelve un campo con tipo incorrecto', () => {
    const invalidResponse = { id: 123, title: 'Test', status: 'pending' };
    const result = TaskSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('detecta cuando la API omite un campo requerido', () => {
    const incompleteResponse = { id: '1', status: 'pending' };
    const result = TaskSchema.safeParse(incompleteResponse);
    expect(result.success).toBe(false);
  });

  it('detecta cuando la API envía un status inválido', () => {
    const invalidStatus = { id: '1', title: 'Test', status: 'archived' };
    const result = TaskSchema.safeParse(invalidStatus);
    expect(result.success).toBe(false);
  });
});

describe('API Contract - taskService (validación real contra el servicio)', () => {
  it('fetchTasks() resuelve con los datos cuando la respuesta cumple el contrato', async () => {
    server.use(
      http.get(`${API_URL}/tasks`, () =>
        HttpResponse.json([
          { id: '1', title: 'Tarea válida', status: 'pending' },
          { id: '2', title: 'Otra tarea válida', status: 'completed' },
        ])
      )
    );

    const tasks = await fetchTasks();

    expect(tasks).toEqual([
      { id: '1', title: 'Tarea válida', status: 'pending' },
      { id: '2', title: 'Otra tarea válida', status: 'completed' },
    ]);
  });

  it('fetchTasks() rechaza cuando la respuesta no cumple el contrato (falta title)', async () => {
    server.use(
      http.get(`${API_URL}/tasks`, () =>
        HttpResponse.json([{ id: '1', status: 'pending' }])
      )
    );

    await expect(fetchTasks()).rejects.toThrow();
  });

  it('createTask() resuelve con la tarea creada cuando la respuesta cumple el contrato', async () => {
    server.use(
      http.post(`${API_URL}/tasks`, () =>
        HttpResponse.json(
          { id: '99', title: 'Tarea creada', status: 'pending' },
          { status: 201 }
        )
      )
    );

    const task = await createTask('Tarea creada');

    expect(task).toEqual({ id: '99', title: 'Tarea creada', status: 'pending' });
  });

  it('createTask() rechaza cuando la respuesta trae un status fuera del enum permitido', async () => {
    server.use(
      http.post(`${API_URL}/tasks`, () =>
        HttpResponse.json(
          { id: '99', title: 'Tarea creada', status: 'archived' },
          { status: 201 }
        )
      )
    );

    await expect(createTask('Tarea creada')).rejects.toThrow();
  });
});
