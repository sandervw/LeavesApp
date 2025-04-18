import StorynodeCreate from '../part/StorynodeCreate';
import TemplateCreate from '../part/TemplateCreate';
import ElementList from '../part/ElementList';
import usePage from '../../hooks/usePage';

const AddSidebar = () => {

    const { addables, currentPage } = usePage();

    return (
        <aside className='sidebar container'>
            {(currentPage === 'templates' || currentPage === 'templateDetail')
                ? <TemplateCreate />
                : <StorynodeCreate />}
            <ElementList elements={addables} kind='templates' listType='static' />
        </aside>
    );
    
};

export default AddSidebar;