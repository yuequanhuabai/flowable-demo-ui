import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const startProcess = async () => {
    try {
      const response = await fetch('/api/start-process', { method: 'POST' });
      if (response.ok) {
        alert('Process started!');
        fetchTasks(); // Refresh tasks after starting a new process
      } else {
        alert('Failed to start process');
      }
    } catch (error) {
      console.error('Error starting process:', error);
    }
  };

  const completeTask = async (taskIdWithPrefix) => {
    // Extract the raw task ID from the string "Task ID: xxx, Task Name: yyy"
    const taskId = taskIdWithPrefix.split(',')[0].replace('Task ID: ', '').trim();
    if (!taskId) {
        alert('Could not extract Task ID.');
        return;
    }
    try {
      const response = await fetch(`/api/complete-task/${taskId}`, { method: 'POST' });
      if (response.ok) {
        alert(`Task ${taskId} completed!`);
        fetchTasks(); // Refresh tasks after completing one
      } else {
        alert('Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Flowable Demo</h1>
        <button onClick={startProcess}>Start New Process</button>
        <h2>Tasks for demoUser</h2>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {task}
                <button onClick={() => completeTask(task)} style={{ marginLeft: '10px' }}>
                  Complete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks found.</p>
        )}
      </header>
    </div>
  );
}

export default App;