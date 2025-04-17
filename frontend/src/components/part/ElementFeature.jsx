import { DraggableHeaderTrait, LabeledParagraphTrait } from './common/ElementTraits';
import MarkdownText from './common/MarkdownText';

const ElementFeature = ({ element, onUpdate }) => {
    const { name, kind, type, wordWeight, wordLimit, wordCount } = element;

    return (
        <>
            <div className='box'>
                <DraggableHeaderTrait trait="name" value={name} onUpdate={onUpdate} editable={true} />
                <LabeledParagraphTrait trait="type" value={type} label='Type: ' editable={false} />
                {(kind === 'template' && wordWeight)
                    && <LabeledParagraphTrait trait="wordWeight" value={wordWeight} label='Word Weight: ' onUpdate={onUpdate} editable={true} />}
                {kind === 'storynode' &&
                    <>
                        <LabeledParagraphTrait trait="wordLimit" value={wordLimit} label='Word Limit: ' onUpdate={onUpdate} editable={type === 'root'} />
                        {type === 'leaf'
                            && <LabeledParagraphTrait trait="wordCount" value={wordCount} label='Word Count: ' editable={false} />}
                    </>}
            </div>
            <div className='box'>
                <MarkdownText
                    text={element.text}
                    update={(val) => onUpdate('text', val)}
                    wordCount={(val) => onUpdate('wordCount', val)} />
            </div>
        </>
    );
};

export default ElementFeature;