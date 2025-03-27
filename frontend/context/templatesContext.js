import { createContext, useReducer } from "react";

const TemplatesContext = createContext();

// state represents the previous state of the data, action is the object which is passed into the dispatch function (type and payload)
const TemplatesReducer = (state, action) => {
    console.log(action);
    
    switch (action.type){
        case 'SET_TEMPLATES':
            return {
                listTemplates: action.payload,
                detailTemplate: state.detailTemplate
            }
        case 'SET_DETAILTEMPLATE':
            return {
                listTemplates: state.listTemplates,
                detailTemplate: action.payload
            }
        case 'CREATE_TEMPLATE':
            return {
                listTemplates: [...state.listTemplates, action.payload],
                detailTemplate: state.detailTemplate
            }
        case 'UPDATE_TEMPLATE':
            return {
                listTemplates: state.listTemplates.map(template => template._id === action.payload._id ? action.payload : template),
                detailTemplate: state.detailTemplate
            }
        case 'DELETE_TEMPLATE':
            return {
                listTemplates: state.listTemplates.filter(template => template._id !== action.payload),
                detailTemplate: state.detailTemplate
            }
        default:
            return state;
    }
}

// Example use: Type describes the state change, payload represents data to make the change
// dispatch({type: 'CREATE_TEMPLATE', payload: [{}, {}]})

// TemplatesContext.Provider can provide values to the components it wraps
const TemplatesContextProvider = ({children}) => {
    // Usereducer similar to UseState
    // The reducer function (listTemplatesReducer) is invoked whenever the dispatch function is called
    const [state, dispatch] = useReducer(TemplatesReducer, {
        listTemplates: null,
        detailTemplate: null
    });

    return (
        <TemplatesContext.Provider value={{...state, dispatch}}>
            {children}
        </TemplatesContext.Provider>
    )
}

export { TemplatesContext, TemplatesReducer, TemplatesContextProvider };