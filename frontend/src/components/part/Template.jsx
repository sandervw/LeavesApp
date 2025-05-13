import { useNavigate } from 'react-router-dom';
import MarkdownText from './common/MarkdownText';
import Draggable from '../wrapper/Draggable';
import { Header3Trait } from './common/ElementTraits';

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
            className='draggable'>
            <Header3Trait
                trait="name"
                value={templateData.name}
                dragHandler={true}
                className='clickable'
                onClick={() => handleDetail()} />
            <div>
                <MarkdownText text={templateData.text} update={(val) => listFunction('text', val, templateData)} />
            </div>
        </Draggable>
    );
};

export default Template;