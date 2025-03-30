import Template from "./Template";
import TemplateCreate from "./TemplateCreate"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {  upsertElement, fetchElement, fetchChildren, fetchElements, deleteElement } from "../services/apiService";
import MarkdownText from "./MarkdownText";
import useTemplateContext from "../hooks/useTemplatesContext";

import DeleteConfirmation from "./DeleteConfirmation";

const TemplateDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const {listTemplates, detailTemplate, dispatch} = useTemplateContext();
    const [isPending, setIsPending] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [subType, setSubType] = useState(null);
    const [subTemplates, setSubTemplates] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const data1 = await fetchElement('templates', location.state);
            const data1subType = 'branch';
            setSubType(data1subType);
            const data2 = await fetchChildren('templates', data1._id);
            const data3 = await fetchElements('templates', 'type='+data1subType);
            setSubTemplates(data3); // Need to keep this as state, rather than context; context already in use by parent's children
            await dispatch({type: 'SET_TEMPLATES', payload: data2});
            await dispatch({type: 'SET_DETAILTEMPLATE', payload: data1});
            setIsPending(false);
        };
        fetchData();
    }, [location.state, dispatch]);


    // Updates the name, purposes, or children
    const updateTemplate = async (attr, val) => {
        
        // Updates within this this element; changes to name/purposes
        const name = attr==='name' ? val : detailTemplate.name;
        const text = attr==='text' ? val : detailTemplate.text;
        const wordWeight = attr==='wordWeight' ? val : detailTemplate.wordWeight;
        let newChildren = detailTemplate.children ? [...detailTemplate.children] : [];
        // Otherwise, function was called by a child component to add/remove an element
        if (attr === 'add'){
            newChildren.push(val);
            // Need to pass actual template object for dispatch
            await dispatch({type: 'CREATE_TEMPLATE', payload: val});
        }
        if (attr === 'remove'){
            newChildren = detailTemplate.children.filter(child => child !== val._id);
            await dispatch({type: 'DELETE_TEMPLATE', payload: val._id});
        }
        const newTemplate = {...detailTemplate, name, text, children: newChildren, wordWeight};
        await upsertElement('templates', newTemplate);
        dispatch({type: 'SET_DETAILTEMPLATE', payload: newTemplate});
    }

    const handleDelete = async () => {
        await deleteElement('templates', detailTemplate._id);
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
                        >{detailTemplate.name}</h2>
                    <p>{detailTemplate.type}</p>
                    <div className="wordweight">
                        <p>Weight: </p>
                        <p
                        contentEditable
                        suppressContentEditableWarning={true}
                        id={"wordWeight"}
                        onBlur={(e) => updateTemplate('wordWeight', e.target.innerText)}
                        >{detailTemplate.wordWeight}</p>
                    </div>
                </div>
                <div className="text box">
                    <h3>Purposes</h3>
                    <MarkdownText text={detailTemplate.text} update={(val) => updateTemplate('text', val)} />
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
            {listTemplates && listTemplates.map((child) => 
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
            <TemplateCreate parent={detailTemplate} subType={subType} />
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