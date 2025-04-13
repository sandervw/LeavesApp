import { useNavigate } from 'react-router-dom';
import MarkdownText from "./MarkdownText";
import Draggable from '../wrapper/Draggable';

const Template = (props) => {
    const navigate = useNavigate();
    const templateData = { ...props.templateData };
    const listFunction = props.listFunction;
    const source = props.source;

    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/templatedetail', { state: templateData._id });
    };

    return (
        <Draggable
            id={templateData._id}
            source={source}
            data={templateData}
            className="element">
            <div onClick={(e) => handleDetail(e)}>
                <h4>{templateData.name}</h4>
            </div>
            <div>
                <MarkdownText text={templateData.text} update={(val) => listFunction('text', val, templateData)} />
            </div>
        </Draggable>
    );
};

export default Template;