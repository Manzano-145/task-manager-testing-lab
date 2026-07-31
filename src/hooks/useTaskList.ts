import { useState } from 'react';
import { Task } from '../types';
import { createTaskFromTitle } from '../utils/createTaskFromTitle';

export function useTaskList(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);

  const addTask = (title: string) => {
    if (!title.trim()) {
      setError('El título no puede estar vacío');
      return;
    }
    setError(null);
    const newTask = createTaskFromTitle(title, Date.now().toString());
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const taskCount = tasks.length;

  return { tasks, error, addTask, removeTask, taskCount };
}
