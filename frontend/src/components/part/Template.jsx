import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import Draggable from "../wrapper/Draggable";
import MarkdownText from "../common/MarkdownText";
import useAddableContext from '../../hooks/useAddableContext';

const Template = (props) => {

    const {dispatch} = useAddableContext();
    const apiCall = useAPI();
    const navigate = useNavigate();
    const templateData = {...props.templateData};
    
    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/templatedetail', {state: templateData._id});
    }

    // Updates the name, purposes, or children
    const updateTemplate = async (attr, val) => {
        await apiCall('upsertElement', 'templates', {...templateData, [attr]: val});
        dispatch({type: 'UPDATE_ADDABLE', payload: {...templateData, [attr]: val}});
    }
    
    return ( 
        
        <Draggable
            id={templateData._id}
            data={templateData}
            method="createFromTemplate">
            <div className="element" key={templateData._id}>
                <div onClick={(e) => handleDetail(e)}>
                    <h4>{templateData.name}</h4>
                </div>
                <div>
                    <MarkdownText text={templateData.text} update={(val) => updateTemplate('text', val)} />
                </div>
            </div>
        </Draggable>
     );
}
 
export default Template;