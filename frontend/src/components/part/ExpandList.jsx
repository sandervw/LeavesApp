import { useState } from 'react';
import { Link } from 'react-router-dom';
import SVG from './common/SVG';

const ExpandList = ({ type, title, items }) => {


  const [expand, setExpand] = useState('');

  const toggleExpand = (link) => {
    expand === link && setExpand('');
    expand !== link && setExpand(link);
  };

  return (
    <>
      <li className='list-item display-flex'>
        <SVG
          name='chevron'
          className='flex-child-center'
          props={{ onClick: () => toggleExpand(type) }}
        />
        <Link to={`/${title.toLowerCase()}`} className='list-link'>{title}</Link>
      </li>
      {expand === type && items && items.length > 0 && (
        <ul className='list'>
          {items.map((item) => (
            <li key={item._id} className='list-item display-flex'>
              <SVG src='' className='flex-child-center' />
              <Link to={`/${type.toLowerCase()}detail`} state={item._id} className='list-link'>{item.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ExpandList;