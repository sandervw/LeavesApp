import { useNavigate } from 'react-router-dom';
import MarkdownText from './common/MarkdownText';
import Draggable from '../wrapper/Draggable';
import { Header3Trait } from './common/ElementTraits';

const Storynode = (props) => {
    const navigate = useNavigate();
    const storynodeData = { ...props.storynodeData };
    const listFunction = props.listFunction;
    const source = props.source;
    const locked = props.locked;

    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/storydetail', { state: storynodeData._id });
    };

    return (
        <Draggable
            id={storynodeData._id}
            source={source}
            data={storynodeData}
            className='element'>
            <Header3Trait
                trait="name"
                value={storynodeData.name}
                dragHandler={true}
                className='clickable'
                onClick={() => handleDetail()} />
            <div>
                {storynodeData.type !== 'leaf'
                    ? <MarkdownText text={storynodeData.text} update={(val) => listFunction('text', val, storynodeData)} />
                    : <div className='leafContent'>
                        <MarkdownText
                            text={storynodeData.text}
                            update={(val) => listFunction('text', val, storynodeData)}
                            wordCount={(val) => listFunction('wordCount', val, storynodeData)}
                            locked={locked} />
                    </div>}
            </div>
        </Draggable>
    );
};

export default Storynode;