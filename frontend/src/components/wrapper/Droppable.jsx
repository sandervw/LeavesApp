import { useDroppable, useDndContext } from '@dnd-kit/core';

/**
 * Wrapper for elements that can be dropped into.
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
  const { active } = useDndContext();

  // If any element is being dragged and this is the rubbish box, add a css class for styling
  const className = (active && props.id==='trash') ? 'active-trash' : props.className;
  
  
  return (
    <div ref={setNodeRef} className={className}>
      {props.children}
    </div>
  );
};

export default Droppable;