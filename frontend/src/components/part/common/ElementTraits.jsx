import { DraggableButton } from "./Buttons";
import { useContext } from 'react';
import { DragHandlerContext } from "../../../context/dragHandlerContext";

const HeaderTrait = ({trait, value, onUpdate, editable}) => {
    return (
            <h2
                contentEditable={editable}
                suppressContentEditableWarning={true}
                id={trait}
                onBlur={(e) => onUpdate(trait, e.target.innerText)}
            >{value}</h2>
    );
}

const LabeledHeaderTrait = ({trait, value, label, onUpdate, editable}) => {
    return (
        <div className='inline-trait'>
            <p>{label}</p>
            <HeaderTrait trait={trait} value={value} onUpdate={onUpdate} editable={editable} />
        </div>
    );
}

const DraggableHeaderTrait = ({trait, value, onUpdate, editable}) => {
    const dragHandler = useContext(DragHandlerContext);
    return (
        <div className='inline-trait'>
            <DraggableButton drag-handle='true' {...dragHandler} />
            <HeaderTrait trait={trait} value={value} onUpdate={onUpdate} editable={editable} />
        </div>
    );
}

const ParagraphTrait = ({trait, value, onUpdate, editable}) => {
    return (
        <p
            contentEditable={editable}
            suppressContentEditableWarning={true}
            id={trait}
            onBlur={(e) => onUpdate(trait, e.target.innerText)}
        >{value}</p>
    );
}

const LabeledParagraphTrait = ({trait, value, label, onUpdate, editable}) => {
    return (
        <div className='inline-trait'>
            <p>{label}</p>
            <ParagraphTrait trait={trait} value={value} onUpdate={onUpdate} editable={editable} />
        </div>
    );
}
 
export {
    HeaderTrait,
    LabeledHeaderTrait,
    DraggableHeaderTrait,
    ParagraphTrait,
    LabeledParagraphTrait
}