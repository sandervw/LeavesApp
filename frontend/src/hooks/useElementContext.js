import { ElementContext } from '../context/ElementContext';
import { useContext } from 'react';

const useElementContext = () => {
    // Returns the state and dispatch function from the context
    const context = useContext(ElementContext);
    if(!context){
        throw Error('useElementContext must be used within an ElementContextProvider');
    }
    return context;
}

export default useElementContext;