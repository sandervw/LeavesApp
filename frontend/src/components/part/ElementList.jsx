import React from 'react';
import Template from './Template';
import StoryNode from './Storynode';
import Droppable from '../wrapper/Droppable';
import useAPI from "../../hooks/useAPI";
import useElementContext from "../../hooks/useElementContext";
import useAddableContext from "../../hooks/useAddableContext";

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
    const { element, dispatch: elementDispatch } = useElementContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const apiCall = useAPI();

    // TODO - possibly refactor to handle type updates (leaf-to-branch, branch-to-leaf) on backend
    const handleAdd = async (source, data) => {
        console.log("Adding element:", source, data);
        
        if (listType === "static") return; //Prevent adding to static lists
        let newChild;
        if (listType === "roots") {
            if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, null);
            else newChild = await apiCall('upsertElement', kind, data);  // source = templateCreate or storynodeCreate
        }
        if (listType === "children") {
            if (element.type === 'leaf') element.type = 'branch';
            await apiCall('upsertElement', kind, { ...element });
            if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, element._id);
            else { // source = templateCreate or storynodeCreate
                newChild = await apiCall('upsertElement', kind, data);
                await apiCall('upsertElement', kind, { ...element, children: [...element.children, newChild._id] });
            }
            // Sync frontend
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, children: [...element.children, newChild._id] } });
        }
        newChild && elementDispatch({ type: 'CREATE_CHILD', payload: newChild });
    };

    // Updates one of the child elements
    const updateElement = async (attr, val, data) => {
        await apiCall('upsertElement', kind, { ...data, [attr]: val });
        listType === 'static'
            ? addableDispatch({ type: 'UPDATE_ADDABLE', payload: { ...data, [attr]: val } })
            : elementDispatch({ type: 'UPDATE_ELEMENT', payload: { ...data, [attr]: val } });
    };

    return (
        <Droppable id={`${kind}${listType}`} className="droppable" function={handleAdd}>
            {elements && elements.map((child) => (
                kind === 'storynodes'
                    ? <StoryNode key={child._id} storynodeData={child} source={listType} listFunction={updateElement} />
                    : <Template key={child._id} templateData={child} source={listType} listFunction={updateElement} />
            ))}
        </Droppable>
    );
};

export default ElementList;