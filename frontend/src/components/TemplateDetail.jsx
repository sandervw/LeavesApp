import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Template from "./parts/Template";
import InlineSVG from "./common/InlineSVG";
import DeleteConfirmation from "./overlays/DeleteConfirmation";
import MarkdownText from "./common/MarkdownText";
import Droppable from './wrappers/Droppable';
import AddSidebar from './layout/AddSidebar';
import LinkSidebar from './layout/LinkSidebar';
import useAPI from "../hooks/useAPI";
import useElementContext from "../hooks/useElementContext";


const TemplateDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch } = useElementContext();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log("useEffect called");
            const template = await apiCall('fetchElement', 'templates', location.state);
            await dispatch({ type: 'SET_ELEMENT', payload: template });
            const children = await apiCall('fetchChildren', 'templates', location.state);
            await dispatch({ type: 'SET_CHILDREN', payload: children });
            template && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [location.state, dispatch, apiCall]);

    // Updates for name, text, and wordWeight
    const updateTemplate = async (attr, val) => {
        const updatedTemplate = await apiCall('upsertElement', 'templates', { ...element, [attr]: val });
        dispatch({ type: 'SET_NEWADDABLE', payload: updatedTemplate });
    };

    const handleDelete = async () => {
        await apiCall('deleteElement', 'templates', element._id);
        navigate('/templates');
    };

    return !isPending && (
        <>
            <LinkSidebar />
            <div className="container content">
                <div className="element detail">
                    <div className="box-buttons">
                        <button onClick={() => setShowModal(true)}>
                            <InlineSVG src="/trashcan.svg" alt="delete icon" className="icon" />
                        </button>
                    </div>
                    <div className="box-detail">
                        <h2
                            contentEditable
                            suppressContentEditableWarning={true}
                            id={"name"}
                            onBlur={(e) => updateTemplate('name', e.target.innerText)}
                        >{element.name}</h2>
                        <p>Type: {element.type}</p>
                        <p>Weight: </p>
                        <p
                            contentEditable
                            suppressContentEditableWarning={true}
                            id={"wordWeight"}
                            onBlur={(e) => updateTemplate('wordWeight', e.target.innerText)}
                        >{element.wordWeight}</p>
                    </div>
                    <div className="box-text">
                        <MarkdownText text={element.text} update={(val) => updateTemplate('text', val)} />
                    </div>
                </div>
                {children && children.map((child) =>
                (
                    <Template
                        templateData={child}
                        buttonType='remove'
                        parentFunction={updateTemplate}
                        key={child._id} />
                ))}
                {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
            </div>
            <AddSidebar kind="templates" />
        </>
    );
};

export default TemplateDetail;