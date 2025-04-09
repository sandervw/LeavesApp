import Template from "../components/part/Template";
import Droppable from "../components/wrapper/Droppable";
import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import useElementContext from "../hooks/useElementContext";

const Templates = () => {

    const { children: templates, dispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        const fetchTemplates = async () => {
            const templates = await apiCall('fetchElements', 'templates', 'type=root');
            dispatch({ type: 'SET_CHILDREN', payload: templates });
            dispatch({ type: 'SET_ELEMENT', payload: null });
        };
        fetchTemplates();
    }, [dispatch, apiCall]);

    const createTemplate = async (method, data) => {
        const newTemplate = await apiCall(method, 'templates', data)
        dispatch({ type: 'CREATE_CHILD', payload: newTemplate});
    };

    return (
        <>
            <LinkSidebar />
            <Droppable id="droppable" className="content container" function={createTemplate}>
                {(templates) && templates.map((template) => (
                    <Template
                        templateData={template}
                        buttonType='delete'
                        key={template._id} />
                ))}
            </Droppable>
            <AddSidebar page="templates" />
        </>
    );
};

export default Templates;