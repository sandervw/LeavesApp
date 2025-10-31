import { Header2Trait, ParagraphTrait } from './common/ElementTraits';
import MarkdownText from './common/MarkdownText';

/**
 * Compoenent used by the Detail page to display the main features of an element
 * @param {Object} props.element - The element to be displayed
 * @param {Function} props.onUpdate - The function to be called when the element is updated (with API call)
 * @param {Function} props.onUpdateLocal - The function to be called for frontend-only updates (no API call)
 */
const ElementFeature = ({ element, onUpdate, onUpdateLocal }) => {
    const { name, kind, type, wordWeight, wordLimit, wordCount } = element;

    return (
        <>
            <div className='box traits'>
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
                {(kind === 'template' && wordWeight) &&
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
                            data-placeholder="None"
                            onBlur={(e) => onUpdate('wordLimit', e.target.innerText)}
                            contentEditable={type === 'root'} />
                        <ParagraphTrait
                            trait="wordCount"
                            value={wordCount}
                            label='Word Count: '
                            contentEditable={false} />
                    </>}
            </div>
            <div className='box'>
                <MarkdownText
                    text={element.text}
                    update={(val) => onUpdate('text', val)}
                    wordCount={kind === 'storynode' && type === 'leaf' && onUpdateLocal ? (val) => onUpdateLocal('wordCount', val) : undefined} />
            </div>
        </>
    );
};

export default ElementFeature;