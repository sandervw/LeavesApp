import { StorynodesContext } from "../context/StorynodesContext";
import { useContext } from "react";

const useStorynodeContext = () => {
    // Hook returns the value of the StorynodesContext, which is the value passed into the provider component (state and dispatch)
    // TLDR: This hook returns the state and dispatch function from the context
    const context = useContext(StorynodesContext);

    // Check that we are within the scope of the context provider
    if(!context){
        throw Error('useStorynodeContext must be used within a StorynodeContextProvider');
    }
    
    return context;
}

export default useStorynodeContext;