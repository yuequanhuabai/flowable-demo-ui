import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // The login function will be simple for HTTP Basic Auth.
    // We just store the user details (like username) for display purposes.
    // The browser handles the actual authentication header.
    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        // For basic auth, we can't truly "log out" other than closing the browser.
        // This function will clear the user state in the app.
        setUser(null);
        // A common trick to force the browser to clear credentials is to trigger a 401,
        // but for this demo, we'll just clear the state.
    };

    // Check if user is already logged in on app start
    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await fetch('/api/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Not logged in", error);
            }
        };
        checkUser();
    }, []);


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
