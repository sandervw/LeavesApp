import { createContext, useReducer } from 'react';

const TreelistContext = createContext();

/**
 * A list of the trees (templates or stories) created by the user.
 * Used in the sidebar and searchbar.
 * @param {Object} state - a set of IDs (for links) and names (for display)
 */
const TreelistReducer = (state, action) => {
    switch (action.type){
        case 'SET_TREES':
            return {
                trees: action.payload
            }
        case 'DELETE_TREE':
            return {
                trees: state.trees.filter(tree => tree._id !== action.payload)
            }
        case 'CREATE_TREE':
            return {
                trees: [...state.trees, action.payload]
            }
        default:
            return state;
    }
}

// AddableContext.Provider can provide values to the components it wraps
const TreelistContextProvider = ({children}) => {
    // UseReducer similar to useState
    const [state, dispatch] = useReducer(TreelistReducer, {
        trees: null
    });

    return (
        <TreelistContext.Provider value={{...state, dispatch}}>
            {children}
        </TreelistContext.Provider>
    )
}

export { TreelistContext, TreelistReducer, TreelistContextProvider };