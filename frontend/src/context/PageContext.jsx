import { createContext, useReducer } from 'react';

/**
 * Context for tracking which page the app is on
 * Used by the sidesbars to help determine which components to show
 */
const PageContext = createContext();

const PageReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PAGE':
            return {
                currentPage: action.payload
            };
        default:
            return state;
    }
};

const PageContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PageReducer, {
            currentPage: null
        });

    return (
        <PageContext.Provider value={{ ...state, dispatch }}>
            {children}
        </PageContext.Provider>
    );
};

export { PageContext, PageReducer, PageContextProvider };