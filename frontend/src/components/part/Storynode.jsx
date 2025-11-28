import { useNavigate } from 'react-router-dom';
import MarkdownText from './common/MarkdownText.tsx';
import Draggable from '../wrapper/Draggable';
import { Header3Trait } from './common/ElementTraits';

const Storynode = (props) => {
  const navigate = useNavigate();
  const storynodeData = { ...props.storynodeData };
  const listFunction = props.listFunction;
  const source = props.source;
  const locked = props.locked;
  const parentWordLimit = props.parentWordLimit;
  const totalWordCount = props.totalWordCount;

  // Go to detailed view of the element
  const handleDetail = () => {
    navigate('/storydetail', { state: storynodeData._id });
  };

  // Calculate effective word limit for leaf nodes based on parent's limit and siblings' word counts
  const calculateEffectiveLimit = () => {
    if (storynodeData.type !== 'leaf') return undefined;

    // If parent has a word limit, calculate how many words this leaf can have
    let effectiveLimit = undefined;
    if (parentWordLimit) {
      // Available words = parent limit - (total words - this leaf's words)
      effectiveLimit = parentWordLimit - (totalWordCount - (storynodeData.wordCount || 0));
    }

    // If this leaf has its own word limit, use the stricter (smaller) of the two
    if (storynodeData.wordLimit) {
      effectiveLimit = effectiveLimit
        ? Math.min(effectiveLimit, storynodeData.wordLimit)
        : storynodeData.wordLimit;
    }

    return effectiveLimit;
  };

  const effectiveWordLimit = calculateEffectiveLimit();

  return (
    <Draggable
      id={storynodeData._id}
      source={source}
      data={storynodeData}
      className='card container'>
      <Header3Trait
        trait="name"
        value={storynodeData.name}
        dragHandler={true}
        className='card-header'
        onClick={() => handleDetail()} />
      <div>
        {storynodeData.type !== 'leaf'
          ? <MarkdownText text={storynodeData.text} update={(val) => listFunction('text', val, storynodeData)} />
          : <MarkdownText // Word count is only necessary on leaf notes
            text={storynodeData.text}
            update={(val) => listFunction('text', val, storynodeData)}
            wordCount={listFunction ? (val) => listFunction('wordCount', val, storynodeData) : undefined}
            wordLimit={effectiveWordLimit}
            locked={locked} />}
      </div>
    </Draggable>
  );
};

export default Storynode;