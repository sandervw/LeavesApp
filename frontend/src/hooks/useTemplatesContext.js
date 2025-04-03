import { TemplatesContext } from "../context/TemplatesContext";
import { useContext } from "react";

const useTemplateContext = () => {
    // Hook returns the value of the TemplatesContext, which is the value passed into the provider component (state and dispatch)
    // TLDR: This hook returns the state and dispatch function from the context
    const context = useContext(TemplatesContext);

    // Check that we are within the scope of the context provider
    if(!context){
        throw Error('useTemplatesContext must be used within a TemplatesContextProvider');
    }
    
    return context;
}
 
export default useTemplateContext;