import ElementList from '../../components/part/ElementList';
import usePage from '../../hooks/usePage';

/**
 * Main page for user stories
 * Renders an ElementList component with stories returned by the usePage hook
 */
const Stories = () => {

  const { error, isPending, children } = usePage({ page: 'stories' });

  return error
    ? <div className='error container'>{error}</div>
    : isPending
      ? <div className='loading container'>Loading...</div>
      : <div className='page container'>
        <ElementList elements={children} kind='storynode' listType='roots' />
      </div>;

};

export default Stories;