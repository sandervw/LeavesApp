import React from 'react';
import {useDroppable} from '@dnd-kit/core';

const Droppable = (props) => {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
    data: { function: props.function }
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };
  
  
  return (
    <div ref={setNodeRef} className={props.className} style={style}>
      {props.children}
    </div>
  );
};

export default Droppable;