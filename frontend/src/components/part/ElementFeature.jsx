const ElementFeature = ({ element, onUpdate }) => {

    const { name, kind, type, wordWeight, wordLimit, wordCount } = element;

    return (
        <div className="box">
            <h2
                contentEditable
                suppressContentEditableWarning={true}
                id={"name"}
                onBlur={(e) => onUpdate('name', e.target.innerText)}
            >{name}
            </h2>
            <p>Type: {type}</p>
            {(kind === "template" && wordWeight) && <div>
                <p>Weight:</p>
                <p
                    contentEditable
                    suppressContentEditableWarning={true}
                    id={"wordWeight"}
                    onBlur={(e) => onUpdate('wordWeight', e.target.innerText)}
                >{wordWeight}
                </p>
            </div>}
            {kind === "storynode" &&
                <>
                    {type === 'root'
                        ? <div>
                            <p>Word Limit: </p>
                            <p
                                contentEditable
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate('wordLimit', e.target.innerText)}
                            >{wordLimit}</p>
                        </div>
                        : <div>
                            <p>Word Limit: {wordLimit}</p>
                        </div>}
                    {type === 'leaf' &&
                        <div>
                            <h3>Word count: {wordCount}</h3>
                        </div>}
                </>
            }
        </div>
    );
};

export default ElementFeature;