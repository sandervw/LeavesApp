import { useState } from 'react';
import { Link } from 'react-router-dom';
import InlineSVG from './common/InlineSVG';

const ExpandList = ({ type, items }) => {

    
    const [expand, setExpand] = useState('');

    const toggleExpand = (link) => {
        expand === link && setExpand('');
        expand !== link && setExpand(link);  
    };

    return (
        <>
            <li>
                <InlineSVG
                    src='/chevron.svg'
                    alt='expand icon'
                    className={expand === type ? 'icon expanded' : 'icon'}
                    onClick={() => toggleExpand(type)} />
                <Link to={`/${type.toLowerCase()}`} className='clickable'>{type}</Link>
            </li>
            {expand === type && items && items.length > 0 && (
                <ul className='links'>
                    {items.map((item) => (
                        <li key={item._id}>
                            <InlineSVG src='' className={'icon'} />
                            <Link to={`/${type.toLowerCase()}/detail`} state={item._id} className='clickable'>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default ExpandList;