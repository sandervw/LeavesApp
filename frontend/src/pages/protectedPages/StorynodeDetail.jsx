import { useLocation, useNavigate } from 'react-router-dom';
import { ArchiveButton, DownloadButton, ReturnButton, UnarchiveButton } from '../../components/part/common/Buttons';
import ElementList from '../../components/part/ElementList';
import ElementFeature from '../../components/part/ElementFeature';
import Draggable from '../../components/wrapper/Draggable';
import usePage from '../../hooks/usePage';
import useElementContext from '../../hooks/useElementContext';
import useAPI from '../../hooks/useAPI';

/**
 * Page to display a single story in detail
 * Renders the story (an ElementFeature component) and children (ElementList)
 * Uses the usePage hook to fetch the story and its children
 */
const StorynodeDetail = () => {

  const location = useLocation(); // Grab the element from location state
  const navigate = useNavigate();
  const { error, isPending, children, element } = usePage({ page: 'storynodeDetail', elementID: location.state });
  const { dispatch: elementDispatch } = useElementContext();
  const { apiCall } = useAPI();

  // Updates the element - wordCount updates locally only, other attributes trigger API call
  const updateElement = async (attr, val) => {
    if (attr === 'wordCount') {
      val = parseInt(val);
      elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, [attr]: val } });
    } else {
      if (attr === 'wordLimit') val = parseInt(val);
      const updatedStorynode = await apiCall('upsertElement', element.kind, { ...element, [attr]: val });
      elementDispatch({ type: 'SET_ELEMENT', payload: updatedStorynode });
    }
  };

  const navigateParent = async () => {
    if (!element.parent) navigate('/');
    else navigate('/storydetail', { state: element.parent });
  };

  const downloadStory = async () => {
    const data = await apiCall('downloadStory', element._id);
    const blob = new Blob([data.storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${element.name}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleArchive = async () => {
    await apiCall('upsertElement', 'storynode', { ...element, archived: !element.archived });
    navigate('/');
  };

  return error
    ? <div className='error container'>{error}</div>
    : isPending
      ? <div className='loading container'>Loading...</div>
      : <div className='content container'>
        <Draggable
          id={element._id}
          source='detail'
          data={element}
          className='element detail'>
          <div className='box-buttons'>
            <ReturnButton onClick={navigateParent} />
            <DownloadButton onClick={downloadStory} />
            {(element.type === 'root' && !element.archived)
              && <ArchiveButton onClick={toggleArchive} />}
            {(element.type === 'root' && element.archived)
              && <UnarchiveButton onClick={toggleArchive} />}
          </div>
          <ElementFeature element={element} onUpdate={updateElement} />
        </Draggable>
        <ElementList elements={children} kind='storynode' listType='children' />
      </div>;
};

export default StorynodeDetail;