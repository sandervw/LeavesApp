import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import ElementList from '../components/part/ElementList';
import usePage from '../hooks/usePage';

/**
 * 
 * @returns {JSX.Element} The main component for the Stories page.
 */
const Stories = () => {

    const { error, isPending, storynodes } = usePage('stories');

    

    return (
        <>
            <LinkSidebar />
            {error && <div className='error content container'>{error}</div>}
            {isPending && <div className='loading content container'>Loading...</div>}
            {!isPending && !error &&
            <div className = 'content container'>
                <ElementList elements={storynodes} kind='storynodes' listType='roots' />
            </div>}
            <AddSidebar page='stories' type='root' />
        </>
    );
};

export default Stories;