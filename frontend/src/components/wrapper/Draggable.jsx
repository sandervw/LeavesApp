import React from 'react';
import {useDraggable} from '@dnd-kit/core';

/**
 * Wrapper for elements that can be dragged
 * 
 * @param {string} props.id ID of the draggable element
 * @param {string} props.method API method to call on the element it is dropped on
 * @param {object} props.data Data to be passed to the API method
 * @returns {JSX.Element} Wrapped draggable element
 */
const Draggable = (props) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
    data: props.data
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
};

export default Draggable;