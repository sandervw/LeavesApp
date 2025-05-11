import { createContext, useEffect, useReducer } from 'react';

const AuthContext = createContext();

const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem('user', JSON.stringify(action.payload));
            return {
                user: action.payload
            };
        case 'LOGOUT':
            localStorage.removeItem('user');
            return {
                user: null
            };
        default:
            return state;
    }
};

// Lazy initialization function to load user from local storage
const initializeState = () => {
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    return {
        user: storedUser
    };
};

const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, {}, initializeState);
    useEffect(() => {
        const handleUserUpdated = (e) => {
            const user = e.detail;
            if (user) {
                dispatch({ type: 'LOGIN', payload: user });
            }
            else {
                dispatch({ type: 'LOGOUT' });
            }
        };
        window.addEventListener('userUpdated', handleUserUpdated);
        return () => {
            window.removeEventListener('userUpdated', handleUserUpdated);
        };
    }, []);
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthReducer, AuthContextProvider };