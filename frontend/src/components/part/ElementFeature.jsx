import { HeaderTrait, LabeledParagraphTrait } from './common/ElementTraits';

const ElementFeature = ({ element, onUpdate }) => {
    const { name, kind, type, wordWeight, wordLimit, wordCount } = element;

    return (
        <div className='box'>
            <HeaderTrait trait="name" value={name} onUpdate={onUpdate} editable={true} />
            <LabeledParagraphTrait trait="type" value={type} label='Type:' editable={false} />
            {(kind === 'template' && wordWeight)
                && <LabeledParagraphTrait trait="wordWeight" value={wordWeight} label='Word Weight:' onUpdate={onUpdate} editable={true} />}
            {kind === 'storynode' &&
                <>
                    <LabeledParagraphTrait trait="wordLimit" value={wordLimit} label='Word Limit:' onUpdate={onUpdate} editable={type === 'root'} />
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