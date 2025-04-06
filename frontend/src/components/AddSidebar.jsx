import Template from "../components/Template";
import StorynodeCreate from "../components/StorynodeCreate";
import { useEffect } from "react";
import { createFromTemplate, fetchElements } from "../services/apiService";
import useAddableContext from "../hooks/useAddableContext";
import useElementContext from "../hooks/useElementContext";

const AddSidebar = (props) => {

    const {addables, dispatch: addablesDispatch} = useAddableContext();
    const {dispatch: elementDispatch} = useElementContext();

    const {kind, type} = props;

    useEffect(() => {
        const fetchData = async () => {
            const templates = await fetchElements(kind, `type=${type}`);
            addablesDispatch({type: 'SET_ADDABLES', payload: templates});
        }
        fetchData();
    }, [addablesDispatch, kind, type]);

    const createStory = async (val, template) => {
        console.log("Creating story from template: ", template._id);
        const data = await createFromTemplate(template._id);
        elementDispatch({type: 'CREATE_CHILD', payload: data});
    }

    return ( 
        <aside className="sidebar container">
            <StorynodeCreate />
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