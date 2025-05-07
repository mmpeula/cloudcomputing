// src/components/TaskForm.js
import React, { useState } from 'react';

const TaskForm = ({ addTask }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = (event) => {
    event.preventDefault();

    // Crear nueva tarea con un ID único
    const newTask = {
      id: Date.now(), // Usamos el tiempo como un ID único
      task_name: taskName,
      due_date: dueDate,
      status: status,
    };

    addTask(newTask); // Pasar la nueva tarea al estado de App

    setTaskName('');
    setDueDate('');
    setStatus('pending');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        required
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
