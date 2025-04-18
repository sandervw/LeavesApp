import React, { useState, useEffect } from 'react';
import MarkdownText from './common/MarkdownText';
import Draggable from '../wrapper/Draggable';
import useElementContext from '../../hooks/useElementContext';
import { InputHeader } from './common/ElementTraits';

const StorynodeCreate = () => {
    const { element } = useElementContext();
    const type = element ? 'leaf' : 'root';
    const parent = element ? element._id : null;
    const [newCreate, setNewCreate] = useState({name: '', text: '', type, parent });

    // Update the state when the element context changes
    useEffect(() => {
        setNewCreate({
            name: '',
            text: '',
            type: element ? 'leaf' : 'root',
            parent: element ? element._id : null
        });
    }, [element]);

    return (
        <Draggable
            id='storynodeCreate'
            source='storynodeCreate'
            data={{...newCreate, name: (newCreate.name!=='' ? newCreate.name : 'New ' + type)}}>
            <div className='element'>
                <div>
                    <InputHeader
                        dragHandler={true}
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

export default StorynodeCreate;