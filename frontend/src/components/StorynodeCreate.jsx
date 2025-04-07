import React, { useState } from 'react';
import MarkdownText from "./MarkdownText";
import Draggable from './Draggable';
import useElementContext from "../hooks/useElementContext";

const StorynodeCreate = () => {
    const { element } = useElementContext();
    const subType = element ? 'leaf' : 'root';
    const parent = element ? element._id : null;
    const [newCreate, setNewCreate] = useState({ name: "", text: "", type: subType, parent });

    return (
        <Draggable
            id="newcreate"
            method="upsertElement"
            data={{...newCreate, name: (newCreate.name!=="" ? newCreate.name : 'New ' + subType)}}>
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