import { createContext, useReducer } from 'react';

const AddableContext = createContext();

// Note: We never create or delete addables, we only update them
const AddableReducer = (state, action) => {
    switch (action.type){
        case 'SET_ADDABLES':
            return {
                addables: action.payload,
            }
        case 'UPDATE_ADDABLE':
            return {
                addables: state.addables.map(addable => addable._id === action.payload._id ? { ...addable, ...action.payload } : addable),
            }
        default:
            return state;
    }
}

// AddableContext.Provider can provide values to the components it wraps
const AddableContextProvider = ({children}) => {
    // UseReducer similar to useState
    const [state, dispatch] = useReducer(AddableReducer, {
        addables: null
    });

    return (
        <AddableContext.Provider value={{...state, dispatch}}>
            {children}
        </AddableContext.Provider>
    )
}

export { AddableContext, AddableReducer, AddableContextProvider };