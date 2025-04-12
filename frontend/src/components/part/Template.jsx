import { useNavigate } from 'react-router-dom';
import MarkdownText from "../common/MarkdownText";

const Template = (props) => {
    const navigate = useNavigate();
    const templateData = { ...props.templateData };
    const listFunction = props.listFunction;

    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/templatedetail', { state: templateData._id });
    };

    return (
        <div className="element" key={templateData._id}>
            <div onClick={(e) => handleDetail(e)}>
                <h4>{templateData.name}</h4>
            </div>
            <div>
                <MarkdownText text={templateData.text} update={(val) => listFunction('text', val, templateData)} />
            </div>
        </div>
    );
};

export default Template;