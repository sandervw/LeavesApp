import React, { useState } from 'react';
import MarkdownText from "./MarkdownText";
import Draggable from './Draggable';
import useElementContext from "../hooks/useElementContext";
import useAPI from '../hooks/useAPI';

const StorynodeCreate = () => {
    const { element, dispatch } = useElementContext();
    const apiCall = useAPI();
    const subType = element ? 'leaf' : 'root';
    const [newCreate, setNewCreate] = useState({ name: "", text: "" });

    // Update the parent element with the new child
    const updateParent = async (id) => {
        let parent = { ...element };
        if (!parent.children) parent.children = [];
        if (parent.type === 'leaf') parent.type = 'branch'; // If the parent is a leaf, change it to a branch
        await parent.children.push(id);
        const data = await apiCall('upsertElement', 'storynodes', parent);
        console.log(data);
        dispatch({ type: 'SET_ELEMENT', payload: data });
    };

    // On submission, need to handle two events: adding the new storynode, and possibly addings it ID to parent
    const handleSubmit = async () => {
        let newStorynode = {
            name: newCreate.name ? newCreate.name : 'New ' + subType,
            text: newCreate.text,
            type: subType,
            parent: element ? element._id : null,
        };
        const data = await apiCall('upsertElement', 'storynodes', newStorynode);
        if (element) await updateParent(data._id);
        dispatch({ type: 'CREATE_CHILD', payload: data });
        setNewCreate({ name: "", text: "" });
    };

    return (
        <Draggable id="newcreate" function={() => handleSubmit()}>
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
            </div>
        </Draggable>
    );
};

export default StorynodeCreate;