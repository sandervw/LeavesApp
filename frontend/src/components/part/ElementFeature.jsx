const ElementFeature = ({ element, onUpdate }) => {
    return (
        <div className="box">
            <h2
                contentEditable
                suppressContentEditableWarning={true}
                id={"name"}
                onBlur={(e) => onUpdate('name', e.target.innerText)}
            >{element.name}</h2>
            <p>Type: {element.type}</p>
            <p>Weight: </p>
            <p
                contentEditable
                suppressContentEditableWarning={true}
                id={"wordWeight"}
                onBlur={(e) => onUpdate('wordWeight', e.target.innerText)}
            >{element.wordWeight}</p>
        </div>
    );
};

export default ElementFeature;