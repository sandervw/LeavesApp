import ElementList from '../../components/part/ElementList';
import usePage from '../../hooks/usePage';

/**
 * Main page for archived user stories
 * Renders an ElementList component with stories returned by the usePage hook
 */
const Archive = () => {

  const { error, isPending, children } = usePage({ page: 'archive' });

  return error
    ? <div className='page container'>{error}</div>
    : isPending
      ? <div className='page container'>Loading...</div>
      : <div className='page container'>
        <ElementList elements={children} kind='storynode' listType='roots' />
      </div>;
};

export default Archive;