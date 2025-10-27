import { createContext, useReducer } from 'react';

const ElementContext = createContext();

// state represents the previous state of the data, action is the object which is passed into the dispatch function (type and payload)
const ElementReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CHILDREN':
            return {
                children: action.payload,
                element: state.element
            };
        case 'SET_ELEMENT':
            return {
                children: state.children,
                element: action.payload
            };
        case 'CREATE_CHILD':
            if (state.element) {
                if (state.element.type === 'leaf') state.element.type = 'branch';
                if (state.element.children) {
                    state.element.children = [...state.element.children, action.payload._id];
                    state.element.wordCount = state.element.wordCount + action.payload.wordCount;
                } else {
                    state.element.children = [action.payload._id];
                    state.element.wordCount = action.payload.wordCount;
                }
            }
            return {
                children: [...state.children, action.payload],
                element: state.element
            };
        case 'UPDATE_CHILD':
            state.children = state.children.map(child => {
                if (child._id === action.payload._id) {
                    return {...child, ...action.payload};
                }
                return child;
            });
            if (state.element) state.element.wordCount = state.children.reduce((acc, child) => acc + child.wordCount, 0);
            return {
                children: state.children,
                element: state.element
            };
        case 'DELETE_CHILD':
            if (state.element) {
                state.element.children = state.element.children.filter(child => child !== action.payload._id);
                if (state.element.children.length === 0 && state.element.type === 'branch') state.element.type = 'leaf';
                state.element.wordCount = state.element.wordCount - action.payload.wordCount;
                if (state.element.wordCount < 0) state.element.wordCount = 0;
            }
            return {
                children: state.children.filter(storynode => storynode._id !== action.payload._id),
                element: state.element
            };
        default:
            return state;
    }
};

// ElementContext.Provider can provide values to the components it wraps
const ElementContextProvider = ({ children }) => {
    // Usereducer similar to UseState
    // The reducer function (ElementReducer) is invoked whenever the dispatch function is called
    const [state, dispatch] = useReducer(ElementReducer, {
        children: null,
        element: null
    });

    return (
        <ElementContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ElementContext.Provider>
    );
};

export { ElementContext, ElementReducer, ElementContextProvider };