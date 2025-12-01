import { useDraggable } from '@dnd-kit/core';
import { DragHandlerContext } from '../../context/dragHandlerContext';

/**
 * Wrapper for elements that can be dragged
 * Needs to use a DragHandlerContext in order to attach the drag handler to a nested element
 * 
 * @param {string} props.id ID of the draggable element
 * @param {string} props.source (IE. 'static', 'children', 'roots', 'storynodeCreate', 'templateCreate')
 * @param {object} props.data Data to be passed to the API method
 * @returns {JSX.Element} Wrapped draggable element
 */
const Draggable = (props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    data: {
      element: props.data,
      source: props.source
    }
  });
  const style = isDragging ? { opacity: 0.5 } : undefined;

  // If the element is being dragged, add a css class for styling
  const className = transform ? `${props.className} dragging` : props.className;



  return (
    <DragHandlerContext.Provider key={props.id} value={{ ...listeners, ...attributes }}>
      <div ref={setNodeRef} style={style} className={className} id={props.id}>
        {props.children}
      </div>
    </DragHandlerContext.Provider>
  );
};

export default Draggable;