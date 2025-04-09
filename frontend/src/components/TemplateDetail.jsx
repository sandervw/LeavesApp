import Template from "./Template";
import TemplateCreate from "./TemplateCreate"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import useAPI from "../hooks/useAPI";
import MarkdownText from "./MarkdownText";
import useElementContext from "../hooks/useElementContext";

import DeleteConfirmation from "./DeleteConfirmation";

const TemplateDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const template = await apiCall('fetchElement', 'templates', location.state);
            await elementDispatch({ type: 'SET_ELEMENT', payload: template });
            const children = await apiCall('fetchChildren', 'templates', location.state);
            await elementDispatch({ type: 'SET_CHILDREN', payload: children });
            template && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [location.state, elementDispatch, apiCall]);

    // Updates the name, purposes, or children
    const updateTemplate = async (attr, val) => {
        // Updates within this this element; changes to name/purposes
        const name = attr==='name' ? val : newAddable.name;
        const text = attr==='text' ? val : newAddable.text;
        const wordWeight = attr==='wordWeight' ? val : newAddable.wordWeight;
        let newChildren = newAddable.children ? [...newAddable.children] : [];
        
        // Otherwise, function was called by a child component to add/remove an element
        if (attr === 'add'){
            newChildren.push(val);
            // Need to pass actual template object for dispatch
            await dispatch({type: 'CREATE_ADDABLE', payload: val});
        }
        if (attr === 'remove'){
            newChildren = newAddable.children.filter(child => child !== val._id);
            await dispatch({type: 'DELETE_ADDABLE', payload: val._id});
        }
        
        const newTemplate = {...newAddable, name, text, children: newChildren, wordWeight};
        await apiService.upsertElement('templates', newTemplate);
        dispatch({type: 'SET_NEWADDABLE', payload: newTemplate});
    }

    const handleDelete = async () => {
        await apiService.deleteElement('templates', newAddable._id);
        navigate('/templates');
    }

    return !isPending && ( 
        <div className="container">
            <div className="child detail">
                <div className="nametype box">
                    <h2
                        contentEditable
                        suppressContentEditableWarning={true}
                        id={"name"}
                        onBlur={(e) => updateTemplate('name', e.target.innerText)}
                        >{newAddable.name}</h2>
                    <p>{newAddable.type}</p>
                    <div className="wordweight">
                        <p>Weight: </p>
                        <p
                        contentEditable
                        suppressContentEditableWarning={true}
                        id={"wordWeight"}
                        onBlur={(e) => updateTemplate('wordWeight', e.target.innerText)}
                        >{newAddable.wordWeight}</p>
                    </div>
                </div>
                <div className="text box">
                    <h3>Purposes</h3>
                    <MarkdownText text={newAddable.text} update={(val) => updateTemplate('text', val)} />
                </div>
                <div className="buttons box">
                    <button onClick={() => setShowModal(true)}>
                        <img src="/trashcan.svg" alt="delete icon" />
                    </button>
                </div>
            </div>
            <div className="listHeader">
                <h3>Children:</h3>
            </div>
            {addables && addables.map((child) => 
            (
                <Template
                    templateData={child}
                    buttonType='remove'
                    parentFunction={updateTemplate}
                    key={child._id} />
            ))}
            <div className="listHeader">
                <h3>Add Child:</h3>
            </div>
            <TemplateCreate parent={newAddable} subType={subType} />
            {subTemplates && subTemplates.map((child) => 
            (
                <Template templateData={child}
                buttonType='add'
                parentFunction={updateTemplate}
                key={child._id} />
            ))}
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
     );
}
 
export default TemplateDetail;