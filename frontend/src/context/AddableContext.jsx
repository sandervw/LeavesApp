import { createContext, useReducer } from 'react';

const AddableContext = createContext();

// state represents the previous state of the data, action is the object which is passed into the dispatch function (type and payload)
const AddableReducer = (state, action) => {
    switch (action.type){
        case 'SET_ADDABLES':
            return {
                addables: action.payload,
                newAddable: state.newAddable
            }
        case 'SET_NEWADDABLE':
            return {
                addables: state.addables,
                newAddable: action.payload
            }
        case 'CREATE_ADDABLE':
            return {
                addables: [...state.addables, action.payload],
                newAddable: state.newAddable
            }
        case 'UPDATE_ADDABLE':
            return {
                addables: state.addables.map(addable => addable._id === action.payload._id ? action.payload : addable),
                newAddable: state.newAddable
            }
        case 'DELETE_ADDABLE':
            return {
                addables: state.addables.filter(addable => addable._id !== action.payload),
                newAddable: state.newAddable
            }
        default:
            return state;
    }
}

// Example use: Type describes the state change, payload represents data to make the change
// dispatch({type: 'CREATE_ADDABLE', payload: [{}, {}]})

// AddableContext.Provider can provide values to the components it wraps
const AddableContextProvider = ({children}) => {
    // UseReducer similar to useState
    const [state, dispatch] = useReducer(AddableReducer, {
        addables: null,
        newAddable: null
    });

    return (
        <AddableContext.Provider value={{...state, dispatch}}>
            {children}
        </AddableContext.Provider>
    )
}

export { AddableContext, AddableReducer, AddableContextProvider };