import ElementList from '../../components/part/ElementList';
import usePage from '../../hooks/usePage';

/**
 * Main page for user templates
 * Renders an ElementList component with templates returned by the usePage hook
 */
const Templates = () => {

  const { error, isPending, children } = usePage({ page: 'templates' });

  return error
    ? <div className='page container'>{error}</div>
    : isPending
      ? <div className='page container'>Loading...</div>
      : <div className='page container'>
        <ElementList elements={children} kind='template' listType='roots' />
      </div>;
};

export default Templates;