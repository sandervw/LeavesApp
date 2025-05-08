import ElementList from '../components/part/ElementList';
import usePage from '../hooks/usePage';

/**
 * 
 * @returns {JSX.Element} The main component for the Stories page.
 */
const Stories = () => {

    const { error, isPending, children } = usePage({ page: 'stories' });

    return (
        <>
            {error && <div className='error container'>{error}</div>}
            {isPending && <div className='loading container'>Loading...</div>}
            {!isPending && !error &&
                <div className='container content'>
                    <ElementList elements={children} kind='storynode' listType='roots' />
                </div>}
        </>
    );

};

export default Stories;