import Template from "../components/Template";
import Droppable from "../components/Droppable";
import { useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useAddableContext from "../hooks/useAddableContext";

const Templates = () => {

    const { addables, dispatch } = useAddableContext();

    useEffect(() => {
        const fetchTemplates = async () => {
            const data = await fetchElements('templates', 'type=root');
            dispatch({ type: 'SET_ADDABLES', payload: data });
        };
        fetchTemplates();
    }, [dispatch]);

    return (
        <Droppable id="droppable" className="droppable" >
            <div className="content container">
                {(addables) && addables.map((template) => (
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