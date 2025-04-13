import React from 'react';
import {useDroppable} from '@dnd-kit/core';

/**
 * Wrapper for elements that can be dropped into
 * 
 * @param {ReactNode} props.children Child elements to be wrapped
 * @param {string} props.className Class name for the droppable element
 * @param {function} props.function Function to be called on drop
 * @returns {JSX.Element} Wrapped droppable element
 */
const Droppable = (props) => {
  const {setNodeRef} = useDroppable({
    id: props.id,
    data: { 
      function: props.function
    }
  });
  
  
  return (
    <div ref={setNodeRef} className={props.className}>
      {props.children}
    </div>
  );
};

export default Droppable;