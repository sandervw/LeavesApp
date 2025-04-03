import Template from "../components/Template";
import TemplateCreate from "../components/TemplateCreate"
import { useState, useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useTemplateContext from "../hooks/useTemplatesContext";

const Templates = () => {

    const {listTemplates, dispatch} = useTemplateContext();

    useEffect(() => {
        const fetchTemplates = async () => {
            const data = await fetchElements('templates', 'type=story');
            dispatch({type: 'SET_TEMPLATES', payload: data});
        }
        fetchTemplates();
    }, [dispatch]);

    // Filter for the template list
    const [filter, setFilter] = useState("story");

    const filterTemplates = async (type) => {
        const data = await fetchElements('templates', `type=${type}`);
        dispatch({type: 'SET_TEMPLATES', payload: data});
        setFilter(type);
    }

    return ( 
        <div className="container">
            <TemplateCreate subType={'story'} />
            <div className="listHeader">
                <h2>Current Templates:</h2>
                <select
                    className="listFilter"
                    value={filter}
                    onChange={(e) => filterTemplates(e.target.value)}>
                    <option value=''></option>
                    <option value='story'>Story</option>
                    <option value='act'>Act</option>
                    <option value='chapter'>Chapter</option>
                    <option value='scene'>Scene</option>
                    <option value='blob'>Blob</option>
                </select>
            </div>
            {(listTemplates) && listTemplates.map((template) => (
                <Template
                    templateData={template}
                    buttonType='delete'
                    key={template._id} />
            ))}
        </div>
     );
}
 
export default Templates;