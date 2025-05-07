import React, { useState } from 'react';

const TaskList = ({ tasks, markComplete, editTask, deleteTask }) => {
  const [isEditing, setIsEditing] = useState(null);
  const [editedTask, setEditedTask] = useState({
    task_name: '',
    due_date: '',
  });

  const handleEdit = (task) => {
    setIsEditing(task.id);
    setEditedTask({ task_name: task.task_name, due_date: task.due_date });
  };

  const handleSaveEdit = (taskId) => {
    editTask(taskId, editedTask);
    setIsEditing(null);
  };

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {isEditing === task.id ? (
              <div>
                <input
                  type="text"
                  value={editedTask.task_name}
                  onChange={(e) => setEditedTask({ ...editedTask, task_name: e.target.value })}
                />
                <input
                  type="date"
                  value={editedTask.due_date}
                  onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                />
                <button onClick={() => handleSaveEdit(task.id)}>Save</button>
                <button onClick={() => setIsEditing(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                {task.task_name} - {task.status} - {task.due_date}
                <button onClick={() => markComplete(task.id)}>Mark as Completed</button>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
