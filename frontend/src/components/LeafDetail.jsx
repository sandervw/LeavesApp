import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import DeleteConfirmation from "./DeleteConfirmation";
import MarkdownText from "./MarkdownText";
import { upsertElement, fetchElement, deleteElement } from "../services/apiService";
import useStorynodeContext from "../hooks/useStorynodesContext";

const LeafDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const {detailNode, dispatch: nodesDispatch} = useStorynodeContext();
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(true);

    // Fetch the blob storynode
    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const data1 = await fetchElement('storynodes', location.state);
            await nodesDispatch({type: 'SET_STORYNODES', payload: ''});
            await nodesDispatch({type: 'SET_DETAILNODE', payload: data1});
            setIsPending(false);
        };
        fetchData();
    }, [location.state, nodesDispatch]);

    // Return to parent element
    const navigateParent = async () => {
        if(!detailNode.parent) navigate('/');
        else navigate('/storydetail', {state: detailNode.parent})
    }

    // Updates the name, purposes
    const updateStorynode = async (attr, val) => {
        // Name, Text, WordLimit
        const name = attr==='name' ? val : detailNode.name;
        const text = attr==='text' ? val : detailNode.text;
        const content = attr==='content' ? val : detailNode.content;
        const wordCount = attr==='wordCount' ? val : detailNode.wordCount;
        await upsertElement('storynodes', {...detailNode, name, text, content, wordCount});
        nodesDispatch({type: 'SET_DETAILNODE', payload: {...detailNode, name, text, content, wordCount}});
        console.log(detailNode);
    }

    // Delete the storynode and navigate back to main list
    const handleDelete = async () => {
        deleteElement('storynodes', detailNode._id);
        navigate('/storydetail', {state: detailNode.parent});
    }

    return !isPending && ( 
        <div className="container">
            <div className="child blob-header">
                <div className="nodetitle">
                    <button onClick={() => navigateParent()}>
                        <img src="/return.svg" alt="return icon" />
                    </button>
                    <h2>{detailNode.name}</h2>
                </div>
                
                <button onClick={() => setShowModal(true)}>
                    <img src="/trashcan.svg" alt="delete icon" />
                </button>
            </div>
            <div className="child detail">
                <div className="text box">
                    <h3>Prompt</h3>
                    <MarkdownText id="text" text={detailNode.text} update={(val) => updateStorynode('text', val)} />
                </div>
                <div className="text box">
                    <h3>Content</h3>
                    <MarkdownText id="content"
                            text={detailNode.content}
                            update={(val) => updateStorynode('content', val)}
                            wordCount={(val) => updateStorynode('wordCount', val)} />
                </div>
            </div>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
     );
}
 
export default LeafDetail;