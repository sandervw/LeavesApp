import { createContext, useReducer } from 'react';

const AuthContext = createContext();

const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                user: action.payload
            };
        case 'LOGOUT':
            return {
                user: null
            };
        default:
            return state;
    }
};

// Lazy initialization function to load user from local storage
const initializeState = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    return {
        user: storedUser || null
    };
};

const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, {}, initializeState);
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthReducer, AuthContextProvider };