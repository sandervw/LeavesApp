import Template from "../components/Template";
import StorynodeCreate from "../components/StorynodeCreate";
import { useEffect } from "react";
import { createFromTemplate, fetchElements } from "../services/apiService";
import useTemplateContext from "../hooks/useAddableContext";
import useElementContext from "../hooks/useElementContext";

const AddSidebar = () => {

    const {listTemplates, dispatch: templatesDispatch} = useTemplateContext();
    const {element, dispatch: elementDispatch} = useElementContext();

    useEffect(() => {
        const fetchData = async () => {
            const query = !element ? 'type=root' : 'type=branch';
            const templates = await fetchElements('templates', query);
            templatesDispatch({type: 'SET_TEMPLATES', payload: templates});
        }
        fetchData();
    }, [templatesDispatch, element]);

    const createStory = async (val, template) => {
        console.log("Creating story from template: ", template._id);
        const data = await createFromTemplate(template._id);
        elementDispatch({type: 'CREATE_CHILD', payload: data});
    }

    return ( 
        <aside className="sidebar container">
            <StorynodeCreate />
            {(listTemplates) && listTemplates.map((template) => (
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