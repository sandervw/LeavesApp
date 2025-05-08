import ElementList from '../components/part/ElementList';
import usePage from '../hooks/usePage';

const Templates = () => {

    

    const { error, isPending, children } = usePage({ page: 'templates' });

    return (
        <>
            {error && <div className='error container'>{error}</div>}
            {isPending && <div className='loading container'>Loading...</div>}
            {!isPending && !error &&
                <div className='container content'>
                    <ElementList elements={children} kind='template' listType='roots' />
                </div>}
        </>
    );
};

export default Templates;