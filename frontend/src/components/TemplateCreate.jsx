import React, { useState } from 'react';
import MarkdownText from "./MarkdownText";
import Draggable from './Draggable';
import useElementContext from "../hooks/useElementContext";

//TODO NEED TO REFACTOR THIS WITH NEW CONTEXT HANDLING

const TemplateCreate = () => {
    const { element } = useElementContext();
    const type = element ? 'branch' : 'root';
    const parent = element ? element._id : null;
    const [newCreate, setNewCreate] = useState({ name: "", text: "", type, parent });

    return (
        <Draggable
            id="newcreate"
            method="upsertElement"
            data={{ ...newCreate, name: (newCreate.name !== "" ? newCreate.name : 'New ' + type) }}>
            <div className="element">
                <div>
                    <input
                        placeholder={'New ' + type}
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

export default TemplateCreate;