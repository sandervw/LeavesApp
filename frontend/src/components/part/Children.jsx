import React from 'react';
import Template from '../part/Template';
import StoryNode from '../part/Storynode';
import Droppable from '../wrapper/Droppable';

const Children = ({ children }) => {

    const kind = children[0].kind;

    return (
        <Droppable id="droppable" className="droppable">
            {children && children.map((child) => (
                kind === 'storynode' ?
                    <StoryNode storynodeData={child} key={child._id} /> :
                    <Template templateData={child} key={child._id} />
            ))}
        </Droppable>
    );
}

export default Children;