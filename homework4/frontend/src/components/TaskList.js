import React from 'react';

const TaskList = ({ tasks }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.task_name} - {task.status} - {task.due_date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
