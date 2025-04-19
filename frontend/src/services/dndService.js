import { rectIntersection } from '@dnd-kit/core';

const customCollisionDetectionAlgorithm = ({droppableContainers, ...args}) => {
    // First, let's see if the `trash` droppable rect is intersecting
    const rectIntersectionCollisions = rectIntersection({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) => id === 'trash')
    });
    // Collision detection algorithms return an array of collisions
    if (rectIntersectionCollisions.length > 0) {
        // The trash is intersecting, return early
        return rectIntersectionCollisions;
    }
    // Compute other collisions
    return rectIntersection({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) => id !== 'trash')
    });
};

const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('Drag ended:', active, 'over:', over);
    if (over && active.data.current) {
        const source = active.data.current.source;
        const data = active.data.current.element;
        over.data.current.function(source, data);
    }
};

export { customCollisionDetectionAlgorithm, handleDragEnd };