import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskForm } from '../../src/components/TaskForm';

describe('TaskForm', () => {
  // Se utiliza jest.fn() para observar la interacción del componente
  // sin ejecutar la lógica real del contenedor padre.
  it('renderiza el campo de texto y el botón Guardar', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('Escribe el título de la tarea')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('permite cambiar el texto del campo', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Estudiar pruebas',
    );

    expect(screen.getByDisplayValue('Estudiar pruebas')).toBeTruthy();
  });

  it('llama a onSubmit con el título ingresado al presionar "Guardar"', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      'Mi nueva tarea'
    );
    await fireEvent.press(screen.getByText('Guardar'));

    expect(mockOnSubmit).toHaveBeenCalledWith('Mi nueva tarea');
  });

  it('no llama a onSubmit si el campo está vacío', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.press(screen.getByText('Guardar'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('no llama a onSubmit si el campo contiene solo espacios', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe el título de la tarea'),
      '   ',
    );
    await fireEvent.press(screen.getByText('Guardar'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
