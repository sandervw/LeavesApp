import { rectIntersection } from "@dnd-kit/core";

/**
 * Custom algorithm to detect collisions with the trash droppable first.
 */
const customCollisionDetectionAlgorithm = ({ droppableContainers, ...args }) => {
    // First, let's see if the `trash` droppable rect is intersecting
    const trashCollision = rectIntersection({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) => id === 'trash')
    });
    if (trashCollision.length > 0) {
        // The trash is intersecting, return early
        return trashCollision;
    }
    // Compute other collisions
    return rectIntersection({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) => id !== 'trash')
    });
};

/**
 * Given a drag event, if an element is dragged over a droppable area,
 * call that droppable's function on the dragged element.
 */
const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.data.current) {
        const source = active.data.current.source;
        const data = active.data.current.element;
        over.data.current.function(source, data);
    }
};
export { customCollisionDetectionAlgorithm, handleDragEnd };
