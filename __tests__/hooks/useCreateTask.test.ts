import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCreateTask } from '../../src/hooks/useCreateTask';
import { createTask } from '../../src/services/taskService';

// Se simula taskService para validar la lógica del hook sin depender
// de la red ni del almacenamiento real del dispositivo.
jest.mock('../../src/services/taskService', () => ({
  createTask: jest.fn(),
}));

const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;

describe('useCreateTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicia con lista vacía y estado idle', async () => {
    const { result } = await renderHook(() => useCreateTask());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.status).toBe('idle');
  });

  it('añade una tarea tras submit exitoso', async () => {
    mockCreateTask.mockResolvedValue({
      id: 'task-1',
      title: 'Aprender Jest',
      status: 'pending',
    });

    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Aprender Jest');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Aprender Jest');
    expect(mockCreateTask).toHaveBeenCalledWith('Aprender Jest');
  });

  it('establece estado error cuando createTask falla', async () => {
    mockCreateTask.mockRejectedValue(new Error('Error de red'));

    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea fallida');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.tasks).toEqual([]);
  });

  it('elimina una tarea existente por id', async () => {
    mockCreateTask.mockResolvedValue({
      id: 'task-1',
      title: 'Tarea temporal',
      status: 'pending',
    });

    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea temporal');
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(() => {
      result.current.removeTask('task-1');
    });

    expect(result.current.tasks).toEqual([]);
  });
});
