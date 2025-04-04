import Template from "../components/Template";
import StorynodeCreate from "../components/StorynodeCreate";
import { useEffect } from "react";
import { createFromTemplate, fetchElements } from "../services/apiService";
import useTemplateContext from "../hooks/useTemplatesContext";
import useStorynodeContext from "../hooks/useStorynodesContext";

const AddSidebar = () => {

    const {listTemplates, dispatch: templatesDispatch} = useTemplateContext();
    const {dispatch: nodesDispatch} = useStorynodeContext();

    useEffect(() => {
        const fetchData = async () => {
            const templates = await fetchElements('templates', 'type=root');
            templatesDispatch({type: 'SET_TEMPLATES', payload: templates});
        }
        fetchData();
    }, [templatesDispatch]);

    const createStory = async (val, template) => {
        console.log("Creating story from template: ", template._id);
        const data = await createFromTemplate(template._id);
        nodesDispatch({type: 'CREATE_STORYNODE', payload: data});
    }

    return ( 
        <aside className="sidebar container">
            <StorynodeCreate subType='root' />
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