import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import TasksPage from './components/TasksPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    const { user, logout } = useAuth();

    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/tasks">My Tasks</Link></li>
                        <li style={{ float: 'right' }}>
                            {user ? (
                                <>
                                    <span>Welcome, {user.username}</span>
                                    <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
                                </>
                            ) : (
                                <Link to="/login">Login</Link>
                            )}
                        </li>
                    </ul>
                </nav>

                <main>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tasks"
                            element={
                                <ProtectedRoute>
                                    <TasksPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;