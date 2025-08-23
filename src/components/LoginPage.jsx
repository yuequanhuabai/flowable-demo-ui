import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch available users for easy selection
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (response.ok) {
                    const usersData = await response.json();
                    setUsers(usersData);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.username, formData.password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const handleQuickLogin = (username) => {
        setFormData({ username, password: 'password' });
    };

    return (
        <div style={{ 
            maxWidth: '400px', 
            margin: '50px auto', 
            padding: '30px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Flowable Demo Login</h1>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #ccc', 
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #ccc', 
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#ffe6e6',
                        border: '1px solid #ff9999',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Quick Login (Demo Users):</h3>
                {users.map((user, index) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: 'white',
                        marginBottom: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}>
                        <div>
                            <strong>{user.username}</strong> ({user.role})
                        </div>
                        <button 
                            onClick={() => handleQuickLogin(user.username)}
                            style={{ 
                                padding: '5px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Select
                        </button>
                    </div>
                ))}
                <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '10px',
                    fontStyle: 'italic'
                }}>
                    Default password for all demo users: "password"
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
