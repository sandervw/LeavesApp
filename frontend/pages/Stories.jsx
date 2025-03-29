import { useEffect } from "react";
import { createFromTemplate, fetchElements } from "../services/apiService";
import useStorynodeContext from "../hooks/useStorynodesContext";
import useTemplateContext from "../hooks/useTemplatesContext";

const Stories = () => {

    const {listNodes, dispatch: nodesDispatch} = useStorynodeContext();
    const {listTemplates, dispatch: templatesDispatch} = useTemplateContext();

    useEffect(() => {
        const fetchData = async () => {
            const nodes = await fetchElements('storynodes', 'type=story&archived=false');
            const templates = await fetchElements('templates', 'type=story');
            nodesDispatch({type: 'SET_STORYNODES', payload: nodes});
            templatesDispatch({type: 'SET_TEMPLATES', payload: templates});
        }
        fetchData();
    }, [nodesDispatch, templatesDispatch]);

    return ( 
        <div>
            <div>
                <h2>Current Stories:</h2>
            </div>
            <div className="placeholder">
                <p>Placeholder for list of stories</p>
            </div>
            {/* {(listNodes) && listNodes.map((story) => (
                <Storynode
                storynodeData={story}
                buttonType='delete'
                key={story._id} />
            ))} */}
            <div>
                <h2>New Story:</h2>
            </div>
            <div className="placeholder">
                <p>Placeholder for list of stories</p>
            </div>
            {/* <StorynodeCreate subType='story' /> */}
            {/* {(listTemplates) && listTemplates.map((template) => (
                <Template
                    templateData={template}
                    parentFunction={createStory}
                    buttonType='add'
                    key={template._id} />
            ))} */}
        </div>
     );
}
 
export default Stories;