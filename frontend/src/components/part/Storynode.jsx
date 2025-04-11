import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import DeleteConfirmation from "../overlay/DeleteConfirmation";
import MarkdownText from "../common/MarkdownText";
import useElementContext from '../../hooks/useElementContext';

const Storynode = (props) => {

    const { dispatch } = useElementContext();
    const navigate = useNavigate();
    const apiCall = useAPI();
    const storynodeData = { ...props.storynodeData };
    const locked = props.locked;

    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/storydetail', { state: storynodeData._id });
    };

    // Updates the text of a storynode
    const updateStorynode = async (attr, val) => {
        let updatedNode;
        if (attr === 'text') updatedNode = { ...storynodeData, text: val };
        if (attr === 'wordCount') updatedNode = { ...storynodeData, wordCount: val };
        await apiCall('upsertElement', 'storynodes', updatedNode);
        //if (attr === 'wordCount') parentFunction('wordCount', val);
        dispatch({ type: 'UPDATE_CHILD', payload: updatedNode });
    };

    return (
        <div className="element" key={storynodeData._id}>
            <div onClick={(e) => handleDetail(e)}>
                <h4>{storynodeData.name}</h4>
            </div>
            <div>
                {storynodeData.type !== 'leaf'
                    ? <MarkdownText text={storynodeData.text} update={(val) => updateStorynode('text', val)} />
                    :
                    <div className="leafContent">
                        <MarkdownText
                            text={storynodeData.text}
                            update={(val) => updateStorynode('text', val)}
                            wordCount={(val) => updateStorynode('wordCount', val)}
                            locked={locked} />
                    </div>}
            </div>
        </div>
    );
};

export default Storynode;