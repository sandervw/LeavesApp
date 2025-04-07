import Template from "../components/Template";
import StorynodeCreate from "../components/StorynodeCreate";
import TemplateCreate from "../components/TemplateCreate";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import useAddableContext from "../hooks/useAddableContext";
import useElementContext from "../hooks/useElementContext";

const AddSidebar = (props) => {

    const {addables, dispatch: addablesDispatch} = useAddableContext();
    const {dispatch: elementDispatch} = useElementContext();
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

    const createStory = async (val, template) => {
        console.log("Creating story from template: ", template._id);
        const data = await apiCall('createFromTemplate', template._id);
        elementDispatch({type: 'CREATE_CHILD', payload: data});
    }

    return ( 
        <aside className="sidebar container">
            {(page === 'templates' || page === 'templatedetail')
                ? <TemplateCreate />
                : <StorynodeCreate />}
            {(addables) && addables.map((template) => (
                <Template
                    templateData={template}
                    parentFunction={createStory}
                    buttonType='add'
                    key={template._id} />
            ))}
        </aside>
     );
}
 
export default AddSidebar;