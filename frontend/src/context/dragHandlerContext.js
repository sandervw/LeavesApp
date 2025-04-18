import { createContext } from 'react';

/**
 * Context set by any draggable element with that draggables listeners/attributes
 * Used by element traits to attach drag handlers to nested elements
 */
export const DragHandlerContext = createContext(null);