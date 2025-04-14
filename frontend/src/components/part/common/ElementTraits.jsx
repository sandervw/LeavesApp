const HeaderTrait = (trait, onUpdate, editable) => {
    return (
            <h2
                contentEditable={editable}
                suppressContentEditableWarning={true}
                id={trait}
                onBlur={(e) => onUpdate(trait, e.target.innerText)}
            >{trait}</h2>
    );
}

const LabeledHeaderTrait = (trait, label, onUpdate, editable) => {
    return (
        <div className="inline-trait">
            <p>{label}</p>
            {HeaderTrait(trait, onUpdate, editable)}
        </div>
    );
}

const ParagraphTrait = (trait, onUpdate, editable) => {
    return (
        <p
            contentEditable={editable}
            suppressContentEditableWarning={true}
            id={trait}
            onBlur={(e) => onUpdate(trait, e.target.innerText)}
        >{trait}</p>
    );
}

const LabeledParagraphTrait = (trait, label, onUpdate, editable) => {
    return (
        <div className="inline-trait">
            <p>{label}</p>
            {ParagraphTrait(trait, onUpdate, editable)}
        </div>
    );
}
 
export {
    HeaderTrait,
    LabeledHeaderTrait,
    ParagraphTrait,
    LabeledParagraphTrait
}