import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Storynode from "./Storynode";
import Template from "./Template";
import StorynodeCreate from "./StorynodeCreate";
import DeleteConfirmation from "./DeleteConfirmation";
import MarkdownText from "./MarkdownText";
import { upsertElement, fetchElements, fetchElement, fetchChildren, deleteElement, createFromTemplate, createFile } from "../services/apiService";
import useStorynodeContext from "../hooks/useStorynodesContext";
import useTemplateContext from "../hooks/useTemplatesContext";


const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { listNodes, detailNode, dispatch: nodesDispatch } = useStorynodeContext();
    const { listTemplates, dispatch: templatesDispatch } = useTemplateContext();
    const [showModal, setShowModal] = useState(false);
    const [subType, setSubType] = useState(null);
    const [lockWriting, setLockWriting] = useState(false);
    const [isPending, setIsPending] = useState(true);

    // Fetch the storynode, its childre, and a list of templates that could be added
    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const data1 = await fetchElement('storynodes', location.state);
            const data1subType = 'branch';
            setSubType(data1subType);
            const data2 = await fetchChildren('storynodes', data1._id);
            const data3 = await fetchElements('templates', 'type=' + data1subType);
            await templatesDispatch({ type: 'SET_TEMPLATES', payload: data3 });
            await nodesDispatch({ type: 'SET_STORYNODES', payload: data2 });
            await nodesDispatch({ type: 'SET_DETAILNODE', payload: data1 });
            setIsPending(false);
        };
        fetchData();
    }, [location.state, nodesDispatch, templatesDispatch]);

    // Return to parent element
    const navigateParent = async () => {
        if (!detailNode.parent) navigate('/');
        else navigate('/storydetail', { state: detailNode.parent });
    };

    // Updates the name, purposes, or children
    const updateStorynode = async (attr, val) => {
        // If the attr is a wordcount, ignore value, need to summarize the wordcount of all children
        if (attr === 'wordCount') {
            let sumWords = 0;
            for (const child of listNodes) {
                sumWords += child.wordCount ? child.wordCount : 0;
            }
            // If the word count is over the word limit, lock the blobs
            if (sumWords > detailNode.wordLimit) setLockWriting(true);
            else setLockWriting(false);
            upsertElement('storynodes', { ...detailNode, wordCount: sumWords });
            nodesDispatch({ type: 'SET_DETAILNODE', payload: { ...detailNode, wordCount: sumWords } });
        }
        // In remove case, need to both remove and delete the child tree
        else if (attr === 'remove') {
            deleteElement('storynodes', val);
            nodesDispatch({ type: 'DELETE_STORYNODE', payload: val });
            let data2 = await detailNode.children.filter(child => child !== val);
            if (data2.length === 0 && detailNode.type === 'branch') detailNode.type = 'leaf';
            nodesDispatch({ type: 'SET_DETAILNODE', payload: { ...detailNode, children: data2 } });
        }
        // In add case, need to convert template and all its children to listNodes (do on backend)
        else if (attr === 'add') {
            const data = await createFromTemplate(val._id, detailNode._id);
            if (detailNode.type === 'leaf') detailNode.type = 'branch';
            nodesDispatch({ type: 'CREATE_STORYNODE', payload: data });
            nodesDispatch({ type: 'SET_DETAILNODE', payload: { ...detailNode, children: [...detailNode.children, data._id] } });
        }
        else {
            // Name, Text, WordLimit
            const name = attr === 'name' ? val : detailNode.name;
            const text = attr === 'text' ? val : detailNode.text;
            const wordLimit = attr === 'wordLimit' ? val : detailNode.wordLimit;
            upsertElement('storynodes', { ...detailNode, name, text, wordLimit });
            nodesDispatch({ type: 'SET_DETAILNODE', payload: { ...detailNode, name, text, wordLimit } });
        }
        console.log(detailNode);
    };

    // Delete the storynode and navigate back to main list
    const handleDelete = async () => {
        deleteElement('storynodes', detailNode._id);
        if (!detailNode.parent) navigate('/');
        else navigate('/storydetail', { state: detailNode.parent });
    };

    const downloadStory = async () => {
        const data = await createFile(detailNode._id);
        console.log(data);
    };

    const toggleArchive = async () => {
        await upsertElement('storynodes', { ...detailNode, archived: !detailNode.archived });
        navigate('/');
    };

    return !isPending && (
        <div className="container">
            <div className="sidebar">
                <StorynodeCreate parent={detailNode} subType={subType} />
            </div>
            <div className="content">
                <div className="detail element">
                    <div className="box">
                        <h2
                            contentEditable
                            suppressContentEditableWarning={true}
                            id={"name"}
                            onBlur={(e) => updateStorynode('name', e.target.innerText)}
                        >{detailNode.name}
                        </h2>
                        <h3>Type: {detailNode.type}</h3>
                        <button onClick={() => navigateParent()}>
                            <img src="/return.svg" alt="return icon" />
                        </button>
                        <button onClick={() => downloadStory()}>
                            <img src="/download.svg" alt="download  icon" />
                        </button>
                        {detailNode.type === 'root' &&
                            <button onClick={() => toggleArchive()}>
                                <img src={detailNode.archived ? "/unarchive.svg" : "/archive.svg"} alt="archive  icon" />
                            </button>}
                        <button onClick={() => setShowModal(true)}>
                            <img src="/trashcan.svg" alt="delete icon" />
                        </button>
                        {detailNode.wordWeight && <div className="wordweight">
                            <p>Weight: {detailNode.wordWeight}</p>
                        </div>}
                        {detailNode.type === 'root'
                            ? <div>
                                <h3>Word Limit: </h3>
                                <p
                                    contentEditable
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => updateStorynode('wordLimit', e.target.innerText)}
                                >{detailNode.wordLimit}</p>
                            </div>
                            : <div>
                                <h3>Word Limit: </h3>
                                <p>{detailNode.wordLimit}</p>
                            </div>}
                        {detailNode.type === 'leaf' &&
                            <div>
                                <h3>Word count: </h3>
                                <p>{detailNode.wordCount}</p>
                            </div>}
                    </div>
                    <div className="box">
                        <MarkdownText text={detailNode.text} update={(val) => updateStorynode('text', val)} />
                    </div>

                </div>
                <div>
                    <h3>Children:</h3>
                    {listNodes && listNodes.map((child) =>
                    (
                        <Storynode
                            storynodeData={child}
                            buttonType='remove'
                            parentFunction={updateStorynode}
                            locked={lockWriting}
                            key={child._id} />
                    ))}
                </div>
            </div>
            <div className="sidebar">
                <StorynodeCreate parent={detailNode} subType={subType} />
                {listTemplates && listTemplates.map((child) =>
                (
                    <Template templateData={child}
                        buttonType='add'
                        parentFunction={updateStorynode}
                        key={child._id} />
                ))}
                {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
            </div>
        </div>
    );
};

export default StorynodeDetail;