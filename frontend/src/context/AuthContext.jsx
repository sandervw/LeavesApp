import { createContext, useReducer, useEffect } from 'react';
import { setUser, setUserSetter } from '../config/authClient';

const AuthContext = createContext();

const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            setUser(action.payload);
            localStorage.setItem('user', JSON.stringify(action.payload));
            return {
                user: action.payload
            };
        case 'LOGOUT':
            setUser(null);
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
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUser(storedUser);
    }
    return {
        user: storedUser || null
    };
};

const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, {}, initializeState);
    //Trigger state update
    useEffect(() => {
        setUserSetter(dispatch);
    }, []);
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthReducer, AuthContextProvider };