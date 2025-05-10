import StorynodeCreate from '../part/StorynodeCreate';
import TemplateCreate from '../part/TemplateCreate';
import ElementList from '../part/ElementList';
import usePage from '../../hooks/usePage';
import useAuthContext from '../../hooks/useAuthContext';

const AddSidebar = () => {
    const { addables, currentPage } = usePage();
    const { user } = useAuthContext();

    return (
        !user
            ? <div></div>
            : <aside className='sidebar container'>
                {(currentPage === 'templates' || currentPage === 'templateDetail')
                    ? <TemplateCreate />
                    : <StorynodeCreate />}
                <ElementList elements={addables} kind='template' listType='static' />
            </aside>


    );

};

export default AddSidebar;