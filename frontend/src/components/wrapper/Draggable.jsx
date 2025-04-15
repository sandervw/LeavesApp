import React, { Children, cloneElement } from 'react';
import { useDraggable } from '@dnd-kit/core';

/**
 * Wrapper for elements that can be dragged
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
      source: props.source,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Clone children to inject listeners and attributes into the draggable handle button
  const clonedChildren = Children.map(props.children, (child) => {
    if (React.isValidElement(child) && child.props['drag-handle']) {
      console.log('cloning child', child);
      return cloneElement(child, {
        ...listeners,
        ...attributes,
      });
    }
    return child;
  });

  return (
    <div ref={setNodeRef} style={style} className={props.className}>
      {clonedChildren}
    </div>
  );
};

export default Draggable;