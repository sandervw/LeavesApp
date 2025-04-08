import Template from "../components/Template";
import StorynodeCreate from "../components/StorynodeCreate";
import TemplateCreate from "../components/TemplateCreate";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import useAddableContext from "../hooks/useAddableContext";

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
        <aside className="sidebar container">
            {(page === 'templates' || page === 'templatedetail')
                ? <TemplateCreate />
                : <StorynodeCreate />}
            {(addables) && addables.map((template) => (
                <Template
                    templateData={template}
                    buttonType='add'
                    key={template._id} />
            ))}
        </aside>
     );
}
 
export default AddSidebar;