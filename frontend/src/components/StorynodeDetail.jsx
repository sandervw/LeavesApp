import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Storynode from "./Storynode";
import InlineSVG from "./InlineSVG";
import DeleteConfirmation from "./DeleteConfirmation";
import MarkdownText from "./MarkdownText";
import Droppable from './Droppable';
import AddSidebar from '../components/AddSidebar';
import LinkSidebar from '../components/LinkSidebar';
import apiService from "../services/apiService";
import useElementContext from "../hooks/useElementContext";
import useTemplateContext from "../hooks/useAddableContext";




const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch: elementDispatch } = useElementContext();
    const { dispatch: templatesDispatch } = useTemplateContext();
    const [showModal, setShowModal] = useState(false);
    const [lockWriting, setLockWriting] = useState(false);
    const [isPending, setIsPending] = useState(true);

    // Fetch the storynode, its childre, and a list of templates that could be added
    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const storynode = await apiService.fetchElement('storynodes', location.state);
            const storynodeSubtype = 'branch';
            const children = await apiService.fetchChildren('storynodes', storynode._id);
            const addables = await apiService.fetchElements('templates', 'type=' + storynodeSubtype);
            await templatesDispatch({ type: 'SET_TEMPLATES', payload: addables });
            await elementDispatch({ type: 'SET_CHILDREN', payload: children });
            await elementDispatch({ type: 'SET_ELEMENT', payload: storynode });
            setIsPending(false);
        };
        fetchData();
    }, [location.state, elementDispatch, templatesDispatch]);

    // Return to parent element
    const navigateParent = async () => {
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    // Updates the name, purposes, or children
    const updateStorynode = async (attr, val) => {
        // If the attr is a wordcount, ignore value, need to summarize the wordcount of all children
        if (attr === 'wordCount') {
            let sumWords = 0;
            for (const child of children) {
                sumWords += child.wordCount ? child.wordCount : 0;
            }
            // If the word count is over the word limit, lock the blobs
            if (sumWords > element.wordLimit) setLockWriting(true);
            else setLockWriting(false);
            apiService.upsertElement('storynodes', { ...element, wordCount: sumWords });
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, wordCount: sumWords } });
        }
        // In remove case, need to both remove and delete the child tree
        else if (attr === 'remove') {
            apiService.deleteElement('storynodes', val);
            elementDispatch({ type: 'DELETE_CHILD', payload: val });
            let data2 = await element.children.filter(child => (child !== val && child !== null));
            if (data2.length === 0 && element.type === 'branch') element.type = 'leaf';
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, children: data2 } });
        }
        // In add case, need to convert template and all its children to listNodes (do on backend)
        else if (attr === 'add') {
            const data = await apiService.createFromTemplate(val._id, element._id);
            if (element.type === 'leaf') element.type = 'branch';
            elementDispatch({ type: 'CREATE_CHILD', payload: data });
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, children: [...element.children, data._id] } });
        }
        else {
            // Name, Text, WordLimit
            const name = attr === 'name' ? val : element.name;
            const text = attr === 'text' ? val : element.text;
            const wordLimit = attr === 'wordLimit' ? val : element.wordLimit;
            apiService.upsertElement('storynodes', { ...element, name, text, wordLimit });
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, name, text, wordLimit } });
        }
        console.log(element);
    };

    // Delete the storynode and navigate back to main list
    const handleDelete = async () => {
        apiService.deleteElement('storynodes', element._id);
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    const downloadStory = async () => {
        const data = await apiService.createFile(element._id);
        console.log(data);
    };

    const toggleArchive = async () => {
        await apiService.upsertElement('storynodes', { ...element, archived: !element.archived });
        navigate('/');
    };

    return !isPending && (
        
        <>
        <LinkSidebar />
        <div className="container content">
            <div className="element detail">
                <div className="box-buttons">
                    <button onClick={() => navigateParent()}>
                        <InlineSVG src="/return.svg" alt="return icon" className="icon" />
                    </button>
                    <button onClick={() => downloadStory()}>
                        <InlineSVG src="/download.svg" alt="download  icon" className="icon" />
                    </button>
                    {element.type === 'root' &&
                        <button onClick={() => toggleArchive()}>
                            <InlineSVG src={element.archived ? "/unarchive.svg" : "/archive.svg"} alt="archive  icon" className="icon" />
                        </button>}
                    <button onClick={() => setShowModal(true)}>
                        <InlineSVG src="/trashcan.svg" alt="delete icon" className="icon" />
                    </button>
                </div>
                <div className="box-detail">
                    <h2
                        contentEditable
                        suppressContentEditableWarning={true}
                        id={"name"}
                        onBlur={(e) => updateStorynode('name', e.target.innerText)}
                    >{element.name}
                    </h2>
                    <p>Type: {element.type}</p>
                    {element.wordWeight && <div className="wordweight">
                        <p>Weight: {element.wordWeight}</p>
                    </div>}
                    {element.type === 'root'
                        ? <div>
                            <p>Word Limit: </p>
                            <p
                                contentEditable
                                suppressContentEditableWarning={true}
                                onBlur={(e) => updateStorynode('wordLimit', e.target.innerText)}
                            >{element.wordLimit}</p>
                        </div>
                        : <div>
                            <h3>Word Limit: {element.wordLimit}</h3>
                        </div>}
                    {element.type === 'leaf' &&
                        <div>
                            <h3>Word count: {element.wordCount}</h3>
                        </div>}
                </div>
                <div className="box-text">
                    <MarkdownText text={element.text} update={(val) => updateStorynode('text', val)} />
                </div>

            </div>
            <div>
                <Droppable id="droppable" className="droppable" >
                <h3>Children:</h3>
                {children && children.map((child) =>
                (
                    <Storynode
                        storynodeData={child}
                        buttonType='remove'
                        parentFunction={updateStorynode}
                        locked={lockWriting}
                        key={child._id} />
                ))}
                </Droppable>
            </div>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
        <AddSidebar kind="templates" type="root" />
        </>
    );
};

export default StorynodeDetail;