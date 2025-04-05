import { createContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const AuthReducer = (state, action) => {
    switch (action.type){
        case 'LOGIN':
            return {
                user: action.payload
            }
        case 'LOGOUT':
            return {
                user: null
            }
        default:
            return state;
    }
}

const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, {
        user: null
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            dispatch({ type: 'LOGIN', payload: storedUser });
        }
    }, []); // Load user from local storage on initial render

    console.log('AuthContext state:', state);

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthReducer, AuthContextProvider };