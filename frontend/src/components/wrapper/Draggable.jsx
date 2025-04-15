import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DragHandlerContext } from '../../context/dragHandlerContext';

/**
 * Wrapper for elements that can be dragged
 * Needs to use a DragHandlerContext in order to attack the drag handler to a nested element
 * 
 * @param {string} props.id ID of the draggable element
 * @param {string} props.source (IE. 'static', 'children', 'roots', 'storynodeCreate', 'templateCreate')
 * @param {object} props.data Data to be passed to the API method
 * @returns {JSX.Element} Wrapped draggable element
 */
const Draggable = (props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
    data: {
      element: props.data,
      source: props.source
    }
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;



  return (
    <DragHandlerContext.Provider key={props.id} value={{ ...listeners, ...attributes }}>
      <div ref={setNodeRef} style={style} className={props.className}>
        {props.children}
      </div>
    </DragHandlerContext.Provider>
  );
};

export default Draggable;