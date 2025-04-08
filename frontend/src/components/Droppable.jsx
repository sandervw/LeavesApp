import React from 'react';
import {useDroppable} from '@dnd-kit/core';

const Droppable = (props) => {
  const {setNodeRef} = useDroppable({
    id: 'droppable',
    data: { function: props.function }
  });
  
  
  return (
    <div ref={setNodeRef} className={props.className}>
      {props.children}
    </div>
  );
};

export default Droppable;