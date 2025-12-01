import Template from './Template';
import StoryNode from './Storynode';
import Droppable from '../wrapper/Droppable';
import useAPI from '../../hooks/useAPI';
import useDropHandler from '../../hooks/useDropHandler';
import useElementContext from '../../hooks/useElementContext';
import useAddableContext from '../../hooks/useAddableContext';

/**
 * Component to display a list of elements (children, roots, addables, etc.)
 * @param {Array} props.elements - The list of elements to be displayed
 * @param {string} props.kind - The kind of elements (e.g., 'storynode', 'template')
 * @param {string} props.listType - three types:
 * * 'children' - for children of a node (can be added to or removed)
 * * 'roots' - for main lists of elements (can be added to, removal requires delete confirmation)
 * * 'static' - for lists of addable elements (can't be removed/added to)
 */
const ElementList = ({ elements, kind, listType }) => {
  const { element, dispatch: elementDispatch } = useElementContext();
  const { dispatch: addableDispatch } = useAddableContext();
  const { apiCall } = useAPI();
  const { handleAdd } = useDropHandler(listType);
  const showNoChildren = listType === 'children' && element?.type !== 'leaf' && (!elements || elements.length === 0);

  // Updates one of the child elements - wordCount updates locally only, other attributes trigger API call
  const updateElement = async (attr, val, data) => {
    const child = (attr === 'wordCount')
      ? { ...data, [attr]: parseInt(val) }
      : await apiCall('upsertElement', kind, { ...data, [attr]: val });
    listType === 'static'
      ? addableDispatch({ type: 'UPDATE_ADDABLE', payload: child })
      : elementDispatch({ type: 'UPDATE_CHILD', payload: child });
  };

  // Calculate total word count of all children for word limit enforcement
  const totalWordCount = elements ? elements.reduce((acc, child) => acc + (child.wordCount || 0), 0) : 0;
  const parentWordLimit = element?.wordLimit;

  return (
    <Droppable id={listType} className='list' function={handleAdd}>
      {!showNoChildren
        ? elements && elements.map((child) => (
          kind === 'storynode'
            ? <StoryNode
              key={child._id}
              storynodeData={child}
              source={listType}
              listFunction={updateElement}
              parentWordLimit={parentWordLimit}
              totalWordCount={totalWordCount} />
            : <Template key={child._id} templateData={child} source={listType} listFunction={updateElement} />
        ))
        : <div className='card-description padding-small'>This limb has no branches or leaves.</div>}
    </Droppable>
  );
};

export default ElementList;