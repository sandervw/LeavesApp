import { DraggableButton } from "./Buttons";
import { useContext } from 'react';
import { DragHandlerContext } from "../../../context/dragHandlerContext";

const Header2Trait = ({trait, value, label, dragHandler, ...props}) => {
    const handler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            {dragHandler && <DraggableButton drag-handle='true' {...handler} />}
            {label && <p>{label}</p>}
            <h2
                suppressContentEditableWarning={true}
                id={trait}
                {...props}
            >{value}</h2>
        </div>
    );
}

const Header3Trait = ({trait, value, label, dragHandler, ...props}) => {
    const handler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            {dragHandler && <DraggableButton drag-handle='true' {...handler} />}
            {label && <p>{label}</p>}
            <h3
                suppressContentEditableWarning={true}
                id={trait}
                {...props}
            >{value}</h3>
        </div>
    );
}

const ParagraphTrait = ({trait, value, label, dragHandler, ...props}) => {
    const handler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            {dragHandler && <DraggableButton drag-handle='true' {...handler} />}
            {label && <p>{label}</p>}
            <p
                suppressContentEditableWarning={true}
                id={trait}
                {...props}
            >{value}</p>
        </div>
    );
}
 
export {
    Header2Trait,
    Header3Trait,
    ParagraphTrait
}