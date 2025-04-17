import ElementList from '../components/part/ElementList';
import usePage from '../hooks/usePage';

/**
 * 
 * @returns {JSX.Element} The main component for the Stories page.
 */
const Stories = () => {

    const { error, isPending, children } = usePage('stories');

    return (
        <>
            {error && <div className='error content container'>{error}</div>}
            {isPending && <div className='loading content container'>Loading...</div>}
            {!isPending && !error &&
                <div className='content container'>
                    <ElementList elements={children} kind='storynodes' listType='roots' />
                </div>}
        </>
    );

};

export default Stories;