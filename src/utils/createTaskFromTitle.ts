import { Task } from '../types';

export function createTaskFromTitle(title: string, id: string): Task {
  const trimmed = title.trim();

  if (!trimmed) {
    throw new Error('El título es obligatorio');
  }

  if (!id) {
    throw new Error('El identificador es inválido');
  }

  return {
    id,
    title: trimmed,
    status: 'pending',
  };
}
