import { createContext, useReducer } from "react";

const StorynodesContext = createContext();

// state represents the previous state of the data, action is the object which is passed into the dispatch function (type and payload)
const StorynodesReducer = (state, action) => {
    console.log(action);
    
    switch (action.type){
        case 'SET_STORYNODES':
            return {
                listNodes: action.payload,
                detailNode: state.detailNode
            }
        case 'SET_DETAILNODE':
            return {
                listNodes: state.listNodes,
                detailNode: action.payload
            }
        case 'CREATE_STORYNODE':
            return {
                listNodes: [...state.listNodes, action.payload],
                detailNode: state.detailNode
            }
        case 'UPDATE_STORYNODE':
            return {
                listNodes: state.listNodes.map(storynode => storynode._id === action.payload._id ? action.payload : storynode),
                detailNode: state.detailNode
            }
        case 'DELETE_STORYNODE':
            return {
                listNodes: state.listNodes.filter(storynode => storynode._id !== action.payload),
                detailNode: state.detailNode
            }
        default:
            return state;
    }
}

// Example use: Type describes the state change, payload represents data to make the change
// dispatch({type: 'CREATE_STORYNODE', payload: [{}, {}]})

// StorynodesContext.Provider can provide values to the components it wraps
const StorynodesContextProvider = ({children}) => {
    // Usereducer similar to UseState
    // The reducer function (listNodesReducer) is invoked whenever the dispatch function is called
    const [state, dispatch] = useReducer(StorynodesReducer, {
        listNodes: null,
        detailNode: null
    });

    return (
        <StorynodesContext.Provider value={{...state, dispatch}}>
            {children}
        </StorynodesContext.Provider>
    )
}

export { StorynodesContext, StorynodesReducer, StorynodesContextProvider };