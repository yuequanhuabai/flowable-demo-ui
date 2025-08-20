import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { user } = useAuth();

    const startProcess = async () => {
        try {
            const response = await fetch('/api/start-process', { method: 'POST' });
            if (response.ok) {
                const message = await response.text();
                alert(message);
            } else {
                alert('Failed to start process. Status: ' + response.status);
            }
        } catch (error) {
            console.error('Error starting process:', error);
            alert('An error occurred while starting the process.');
        }
    };

    return (
        <div>
            <h1>Welcome, {user ? user.username : 'Guest'}!</h1>
            <p>This is the main page. From here you can start a new business process.</p>
            <hr />
            <h2>Start a New Process</h2>
            <p>Click the button to start a new approval process. The first task will be assigned to you.</p>
            <button onClick={startProcess}>Start New Process</button>
        </div>
    );
};

export default HomePage;
