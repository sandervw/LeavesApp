import React from 'react';
import Template from './Template';
import StoryNode from './Storynode';
import Droppable from '../wrapper/Droppable';
import useAPI from '../../hooks/useAPI';
import useDropHandler from '../../hooks/useDropHandler';
import useElementContext from '../../hooks/useElementContext';
import useAddableContext from '../../hooks/useAddableContext';

/**
 * 
 * @param {Array} props.elements - The list of elements to be displayed
 * @param {string} props.kind - The kind of elements (e.g., 'storynode', 'template')
 * @param {string} props.listType - three types:
 * * 'children' - for children of a node (can be added to or removed)
 * * 'roots' - for main lists of elements (can be added to, removal requires delete confirmation)
 * * 'static' - for lists of addable elements (can't be removed/added to)
 * @returns {JSX.Element} - The rendered list of elements
 */
const ElementList = ({ elements, kind, listType }) => {
    const { dispatch: elementDispatch } = useElementContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const { apiCall } = useAPI();
    const { handleAdd } = useDropHandler(listType);

    // Updates one of the child elements
    const updateElement = async (attr, val, data) => {
        await apiCall('upsertElement', kind, { ...data, [attr]: val });
        listType === 'static'
            ? addableDispatch({ type: 'UPDATE_ADDABLE', payload: { ...data, [attr]: val } })
            : elementDispatch({ type: 'UPDATE_ELEMENT', payload: { ...data, [attr]: val } });
    };

    return (
        <Droppable id={listType} className='droppable list' function={handleAdd}>
            {elements && elements.map((child) => (
                kind === 'storynode'
                    ? <StoryNode key={child._id} storynodeData={child} source={listType} listFunction={updateElement} />
                    : <Template key={child._id} templateData={child} source={listType} listFunction={updateElement} />
            ))}
        </Droppable>
    );
};

export default ElementList;