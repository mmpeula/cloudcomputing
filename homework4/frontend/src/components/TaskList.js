// src/components/TaskList.js
import React from 'react';

const TaskList = ({ tasks, markComplete }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.task_name} - {task.status} - {task.due_date}
            {/* Mostrar el botón solo si la tarea está pendiente */}
            {task.status === 'pending' && (
              <button onClick={() => markComplete(task.id)}>Mark as Completed</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
