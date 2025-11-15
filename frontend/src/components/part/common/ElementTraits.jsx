import { DraggableButton } from "./Buttons";
import { useContext } from 'react';
import { DragHandlerContext } from "../../../context/dragHandlerContext";

const InputHeader = ({dragHandler, ...props}) => {
    const handler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            {dragHandler && <DraggableButton className='drag-handle' drag-handle='true' {...handler} />}
            <input{...props} />
        </div>
    );
}

const Header2Trait = ({trait, value, label, dragHandler, ...props}) => {
    const handler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            {dragHandler && <DraggableButton className='drag-handle' drag-handle='true' {...handler} />}
            {label && <pre>{label}</pre>}
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
            {dragHandler && <DraggableButton className='drag-handle' drag-handle='true' {...handler} />}
            {label && <pre>{label}</pre>}
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
        <div className='inline-trait subtrait'>
            {dragHandler && <DraggableButton className='drag-handle' drag-handle='true' {...handler} />}
            {label && <pre>{label}</pre>}
            <div
                suppressContentEditableWarning={true}
                id={trait}
                {...props}
            >{value}</div>
        </div>
    );
}
 
export {
    InputHeader,
    Header2Trait,
    Header3Trait,
    ParagraphTrait
}