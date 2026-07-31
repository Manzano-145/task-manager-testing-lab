import { createTaskFromTitle } from '../../src/utils/createTaskFromTitle';

describe('createTaskFromTitle', () => {
  it('crea una tarea con los datos esperados', () => {
    expect(createTaskFromTitle('Estudiar Jest', 'task-1')).toEqual({
      id: 'task-1',
      title: 'Estudiar Jest',
      status: 'pending',
    });
  });

  it('elimina espacios al inicio y al final del título', () => {
    const task = createTaskFromTitle('  Estudiar Jest  ', 'task-1');

    expect(task.title).toBe('Estudiar Jest');
  });

  it('lanza un error cuando el título está vacío', () => {
    expect(() => createTaskFromTitle('', 'task-1')).toThrow('El título es obligatorio');
  });

  it('lanza un error cuando el identificador es inválido', () => {
    expect(() => createTaskFromTitle('Estudiar', '')).toThrow('El identificador es inválido');
  });
});
