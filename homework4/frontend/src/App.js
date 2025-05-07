import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const { instance, accounts } = useMsal();  
  const [tasks, setTasks] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const navigate = useNavigate();

  // Agregar nueva tarea
  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  // Cambiar estado de tarea a "completada"
  const markComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
  };

  // Manejo del login
  const handleLogin = async () => {
    try {
      if (!instance.getAllAccounts().length) {
        const loginResponse = await instance.loginPopup(loginRequest);
        console.log('Login successful:', loginResponse);
        setAccessToken(loginResponse.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Manejo del logout
  const handleLogout = () => {
    instance.logoutRedirect();
    setAccessToken('');
  };

  useEffect(() => {
    if (accounts.length > 0) {
      setAccessToken(accounts[0].idToken);
    }
  }, [accounts]);

  return (
    <div>
      <h1>Task Manager</h1>
      {!accounts.length ? (
        <button onClick={handleLogin}>Sign in with Azure AD</button>
      ) : (
        <>
          <p>Welcome, {accounts[0].username}</p>
          <button onClick={handleLogout}>Sign out</button>
          <TaskForm addTask={addTask} accessToken={accessToken} />
          {/* Pasa la función markComplete como prop */}
          <TaskList tasks={tasks} markComplete={markComplete} />
        </>
      )}
    </div>
  );
};

export default App;
