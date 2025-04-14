import { useEffect } from 'react';
import Template from '../part/Template';
import StorynodeCreate from '../part/StorynodeCreate';
import TemplateCreate from '../part/TemplateCreate';
import ElementList from '../part/ElementList';
import useAPI from '../../hooks/useAPI';
import useAddableContext from '../../hooks/useAddableContext';

const AddSidebar = (props) => {

    const {addables, dispatch: addablesDispatch} = useAddableContext();
    const apiCall = useAPI();

    const {page, type} = props;

    useEffect(() => {
        const fetchData = async () => {
            if (page==='templates') addablesDispatch({type: 'SET_ADDABLES', payload: []});
            else {
                const templates = await apiCall('fetchElements', 'templates', `type=${type}`);
                addablesDispatch({type: 'SET_ADDABLES', payload: templates});
            }
        }
        fetchData();
    }, [addablesDispatch, page, type, apiCall]);

    return ( 
        <aside className='sidebar container'>
            {(page === 'templates' || page === 'templatedetail')
                ? <TemplateCreate />
                : <StorynodeCreate />}
            <ElementList elements={addables} kind='templates' listType='static' />
        </aside>
     );
}
 
export default AddSidebar;