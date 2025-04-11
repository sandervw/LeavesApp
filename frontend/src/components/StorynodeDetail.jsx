import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import InlineSVG from "./common/InlineSVG";
import DeleteConfirmation from "./overlay/DeleteConfirmation";
import MarkdownText from "./common/MarkdownText";
import AddSidebar from './layout/AddSidebar';
import LinkSidebar from './layout/LinkSidebar';
import ElementList from "./part/ElementList";
import ElementFeature from "./part/ElementFeature";
import useAPI from "../hooks/useAPI";
import useElementContext from "../hooks/useElementContext";
import useAddableContext from "../hooks/useAddableContext";

const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch: elementDispatch } = useElementContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(true);

    // Fetch the storynode, its children, and a list of templates that could be added
    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const storynode = await apiCall('fetchElement', 'storynodes', location.state);
            await elementDispatch({ type: 'SET_ELEMENT', payload: storynode });
            const children = await apiCall('fetchChildren', 'storynodes', location.state);
            await elementDispatch({ type: 'SET_CHILDREN', payload: children });
            const addables = await apiCall('fetchElements', 'templates', 'type=branch');
            await addableDispatch({ type: 'SET_ADDABLES', payload: addables });
            storynode && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [location.state, elementDispatch, addableDispatch, apiCall]);

    // Return to parent element
    const navigateParent = async () => {
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    // Updates the name, purposes, or children
    const updateStorynode = async (attr, val) => {
        // TODO - refactor below to work with new list format (maybe do context?)
        // if (attr === 'wordCount') {
        //     let sumWords = 0;
        //     for (const child of children) {
        //         sumWords += child.wordCount ? child.wordCount : 0;
        //     }
        //     // If the word count is over the word limit, lock the blobs
        //     if (sumWords > element.wordLimit) setLockWriting(true);
        //     else setLockWriting(false);
        //     apiCall('upsertElement', 'storynodes', { ...element, wordCount: sumWords });
        //     elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, wordCount: sumWords } });
        // }
        // Name, Text, WordLimit
        const name = attr === 'name' ? val : element.name;
        const text = attr === 'text' ? val : element.text;
        const wordLimit = attr === 'wordLimit' ? val : element.wordLimit;
        apiCall('upsertElement', 'storynodes', { ...element, name, text, wordLimit });
        elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, name, text, wordLimit } });
        console.log(element);
    };

    // Delete the storynode and navigate back to main list
    const handleDelete = async () => {
        await apiCall('deleteElement', 'storynodes', element._id);
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    const downloadStory = async () => {
        const data = await apiCall('createFile', element._id);
        console.log(data);
    };

    const toggleArchive = async () => {
        await apiCall('upsertElement', 'storynodes', { ...element, archived: !element.archived });
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
                    <ElementFeature element={element} onUpdate={updateStorynode} />
                    <div className="box">
                        <MarkdownText text={element.text} update={(val) => updateStorynode('text', val)} />
                    </div>

                </div>
                <ElementList elements={children} kind="storynodes" listType="children" />
                {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
            </div>
            <AddSidebar page="storynodedetail" type="branch" />
        </>
    );
};

export default StorynodeDetail;