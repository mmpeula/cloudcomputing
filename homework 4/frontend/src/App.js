import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

const App = () => {
  const [tasks, setTasks] = useState([]); 

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);  
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <TaskForm addTask={addTask} />  {}
      <TaskList tasks={tasks} />      {}
    </div>
  );
};

export default App;
