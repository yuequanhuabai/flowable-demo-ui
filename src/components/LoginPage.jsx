import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            // This fetch will trigger the browser's basic auth popup.
            // Once the user enters credentials, the browser will automatically
            // send the Authorization header for this and subsequent requests.
            const response = await fetch('/api/me');

            if (response.ok) {
                const userData = await response.json();
                login(userData); // Update the auth context
                navigate('/'); // Redirect to home page
            } else {
                // This will happen if the user cancels the login prompt.
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <p>This application uses HTTP Basic Authentication.</p>
            <p>Click the button below. Your browser will prompt you for a username and password.</p>
            <p>Use one of the users defined in the backend (e.g., user1 / password).</p>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
