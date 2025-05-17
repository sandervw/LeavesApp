import { TreelistContext } from '../context/TreelistContext';
import { useContext } from 'react';

const useTreelistContext = () => {
    const context = useContext(TreelistContext);
    if(!context){
        throw Error('useTreelistContext must be used within a TreelistContextProvider');
    }
    return context;
}
 
export default useTreelistContext;