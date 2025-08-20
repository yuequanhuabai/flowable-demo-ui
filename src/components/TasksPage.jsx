import React, { useState, useEffect } from 'react';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                console.error('Failed to fetch tasks');
                setTasks([]); // Clear tasks on error
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const completeTask = async (taskId) => {
        const approved = window.confirm("Approve this task? (OK for Yes, Cancel for No)");
        const variables = { approved: approved };

        try {
            const response = await fetch(`/api/complete-task/${taskId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables)
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);
                fetchTasks(); // Refresh tasks after completing one
            } else {
                alert('Failed to complete task. Status: ' + response.status);
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('An error occurred while completing the task.');
        }
    };

    return (
        <div>
            <h1>My Tasks</h1>
            <p>Here are the tasks assigned to you.</p>
            <button onClick={fetchTasks}>Refresh Tasks</button>
            <hr />
            {tasks.length > 0 ? (
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <p><strong>Task ID:</strong> {task.id}</p>
                            <p><strong>Task Name:</strong> {task.name}</p>
                            <button onClick={() => completeTask(task.id)} style={{ marginTop: '10px' }}>
                                Complete Task
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tasks found.</p>
            )}
        </div>
    );
};

export default TasksPage;
