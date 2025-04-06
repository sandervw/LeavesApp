import Template from "../components/Template";
import Droppable from "../components/Droppable";
import { useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useTemplateContext from "../hooks/useAddableContext";

const Templates = () => {

    const { listTemplates, dispatch } = useTemplateContext();

    useEffect(() => {
        const fetchTemplates = async () => {
            const data = await fetchElements('templates', 'type=root');
            dispatch({ type: 'SET_TEMPLATES', payload: data });
        };
        fetchTemplates();
    }, [dispatch]);

    return (
        <Droppable id="droppable" className="droppable" >
            <div className="content container">
                {(listTemplates) && listTemplates.map((template) => (
                    <Template
                        templateData={template}
                        buttonType='delete'
                        key={template._id} />
                ))}
            </div>
        </Droppable>
    );
};

export default Templates;