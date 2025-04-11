import React from 'react';
import Template from './Template';
import StoryNode from './Storynode';
import Droppable from '../wrapper/Droppable';
import useAPI from "../../hooks/useAPI";
import useElementContext from "../../hooks/useElementContext";

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
    const { element, dispatch } = useElementContext();
    const apiCall = useAPI();

    // TODO - possibly refactor to handle type updates (leaf-to-branch, branch-to-leaf) on backend
    const handleAdd = async (method, data) => {
        if (listType === "static") return; //Prevent adding to static lists
        let newChild;
        if (listType === "roots") {
            if(method === 'createFromTemplate') newChild = await apiCall(method, data._id, null);
            else newChild = await apiCall(method, kind, data);
        }
        if (listType === "children") {
            if (element.type === 'leaf') element.type = 'branch';
            await apiCall('upsertElement', kind, { ...element });
            if(method === 'createFromTemplate') newChild = await apiCall(method, data._id, element._id);
            else{
                newChild = await apiCall(method, kind, data);
                await apiCall('upsertElement', kind, { ...element, children: [...element.children, newChild._id] });
            }
            // Sync frontend
            dispatch({ type: 'SET_ELEMENT', payload: { ...element, children: [...element.children, newChild._id] } });
        }
        newChild && dispatch({ type: 'CREATE_CHILD', payload: newChild});
    };

    return (
        <Droppable id={`${kind}${listType}`} className="droppable" function={handleAdd}>
            {elements && elements.map((child) => (
                kind === 'storynodes' ?
                    <StoryNode storynodeData={child} key={child._id} /> :
                    <Template templateData={child} key={child._id} />
            ))}
        </Droppable>
    );
}

export default ElementList;