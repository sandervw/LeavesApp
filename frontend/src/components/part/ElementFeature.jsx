import { Header2Trait, ParagraphTrait } from './common/ElementTraits';
import MarkdownText from './common/MarkdownText';

const ElementFeature = ({ element, onUpdate }) => {
    const { name, kind, type, wordWeight, wordLimit, wordCount } = element;

    return (
        <>
            <div className='box'>
                <Header2Trait
                    trait="name"
                    value={name}
                    onBlur={(e) => onUpdate('name', e.target.innerText)}
                    contentEditable={true}
                    dragHandler={true} />
                <ParagraphTrait
                    trait="type"
                    value={type}
                    label='Type: '
                    contentEditable={false} />
                {(kind === 'template' && wordWeight)&&
                    <ParagraphTrait
                        trait="wordWeight"
                        value={wordWeight}
                        label='Word Weight: '
                        onBlur={(e) => onUpdate('wordWeight', e.target.innerText)}
                        contentEditable={true} />}
                {kind === 'storynode' &&
                    <>
                        <ParagraphTrait
                            trait="wordLimit"
                            value={wordLimit}
                            label='Word Limit: '
                            onBlur={(e) => onUpdate('wordLimit', e.target.innerText)}
                            contentEditable={type === 'root'} />
                        {type === 'leaf' &&
                            <ParagraphTrait
                                trait="wordCount"
                                value={wordCount}
                                label='Word Count: '
                                contentEditable={false} />}
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