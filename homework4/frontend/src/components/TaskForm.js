import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ addTask, accessToken }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const newTask = {
      task_name: taskName,
      due_date: dueDate,
      status: status,
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/tasks',
        newTask,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      addTask(response.data);

      setTaskName('');
      setDueDate('');
      setStatus('pending');
    } catch (error) {
      console.error('Error adding task:', error);
    }
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
