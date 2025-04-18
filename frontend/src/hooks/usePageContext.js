import { PageContext } from '../context/PageContext';
import { useContext } from 'react';

const usePageContext = () => {
    const context = useContext(PageContext);
    if(!context){
        throw Error('usePageContext must be used within a PageContextProvider');
    }
    return context;
}
 
export default usePageContext;