import { createContext, useReducer } from 'react';

const ElementContext = createContext();

// state represents the previous state of the data, action is the object which is passed into the dispatch function (type and payload)
const ElementReducer = (state, action) => {
    switch (action.type){
        case 'SET_CHILDREN':
            return {
                children: action.payload,
                element: state.element
            }
        case 'SET_ELEMENT':
            return {
                children: state.children,
                element: action.payload
            }
        case 'CREATE_CHILD':
            return {
                children: [...state.children, action.payload],
                element: state.element.children
                    ? {children: [...state.element.children, action.payload._id], ...state.element}
                    : {children: [action.payload._id], ...state.element}
            }
        case 'UPDATE_CHILD':
            return {
                children: state.children.map(storynode => storynode._id === action.payload._id ? action.payload : storynode),
                element: state.element
            }
        case 'DELETE_CHILD':
            return {
                children: state.children.filter(storynode => storynode._id !== action.payload),
                element: state.element.children
                    ? {children: state.element.children.filter(child => child !== action.payload), ...state.element}
                    : {children: [], ...state.element}
            }
        default:
            return state;
    }
}

// Example use: Type describes the state change, payload represents data to make the change
// dispatch({type: 'CREATE_CHILD', payload: [{}, {}]})

// ElementContext.Provider can provide values to the components it wraps
const ElementContextProvider = ({children}) => {
    // Usereducer similar to UseState
    // The reducer function (ElementReducer) is invoked whenever the dispatch function is called
    const [state, dispatch] = useReducer(ElementReducer, {
        children: null,
        element: null
    });

    return (
        <ElementContext.Provider value={{...state, dispatch}}>
            {children}
        </ElementContext.Provider>
    )
}

export { ElementContext, ElementReducer, ElementContextProvider };