import { AddableContext } from '../context/AddableContext';
import { useContext } from 'react';

const useAddableContext = () => {
    // Hook returns the value of the AddableContext
    const context = useContext(AddableContext);

    // Check that we are within the scope of the context provider
    if(!context){
        throw Error('useAddableContext must be used within an AddableContextProvider');
    }
    
    return context;
}
 
export default useAddableContext;