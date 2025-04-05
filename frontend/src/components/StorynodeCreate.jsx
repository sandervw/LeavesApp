import React, { useState } from 'react';
import { upsertElement } from '../services/apiService';
import MarkdownText from "./MarkdownText";
import InlineSVG from "./InlineSVG";
import Draggable from './Draggable';
import useStorynodeContext from "../hooks/useStorynodesContext";

const StorynodeCreate = () => {
    const { detailNode, dispatch } = useStorynodeContext();
    // All storynodes should have a parent, except for 'story' types
    const subType = detailNode ? 'leaf' : 'story';
    // Set the initial state, with default name
    const [newCreate, setNewCreate] = useState({ name: "", text: "" });

    // Update the parent element with the new child
    const updateParent = async (id) => {
        let parent = { ...detailNode };
        if (!parent.children) parent.children = [];
        if (parent.type === 'leaf') parent.type = 'branch'; // If the parent is a leaf, change it to a branch
        await parent.children.push(id);
        const data = await upsertElement('storynodes', parent);
        console.log(data);
        dispatch({ type: 'SET_DETAILNODE', payload: data });
    };

    // On submission, need to handle two events: adding the new storynode, and possibly addings it ID to parent
    const handleSubmit = async (e) => {
        e.preventDefault();
        let newStorynode = {
            name: newCreate.name,
            text: newCreate.text,
            type: subType,
            parent: detailNode ? detailNode._id : null,
        };
        // Add the new storynode
        const data = await upsertElement('storynodes', newStorynode);
        if (detailNode) await updateParent(data._id);
        dispatch({ type: 'CREATE_STORYNODE', payload: data });
        setNewCreate({ name: "", text: "" });
    };

    return (
        <Draggable id="newcreate" function={(e) => handleSubmit(e)}>
            <div className="element">
                <div>
                    <input
                        placeholder={'New ' + subType}
                        required
                        value={newCreate.name}
                        onChange={(e) => setNewCreate({ ...newCreate, name: e.target.value })}
                    />
                </div>
                <div>
                    <MarkdownText
                        key={newCreate.text}
                        text={newCreate.text}
                        update={(val) => setNewCreate({ ...newCreate, text: val })} />
                </div>
                <div>
                    <button onClick={(e) => handleSubmit(e)}>
                        <InlineSVG src="/save.svg" alt="save icon" className="icon" />
                    </button>
                </div>
            </div>
        </Draggable>
    );
};

export default StorynodeCreate;