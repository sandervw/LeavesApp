import Template from "../components/Template";
import Droppable from "../components/Droppable";
import AddSidebar from '../components/AddSidebar';
import LinkSidebar from '../components/LinkSidebar';
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

    return (
        <>
            <LinkSidebar />
            <Droppable id="droppable" className="content container" >
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