import Storynode from "../components/Storynode";
import AddSidebar from "../components/AddSidebar";
import { useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useStorynodeContext from "../hooks/useStorynodesContext";

const Stories = () => {

    const {listNodes, dispatch: nodesDispatch} = useStorynodeContext();

    useEffect(() => {
        const fetchData = async () => {
            const nodes = await fetchElements('storynodes', 'type=root&archived=false');
            nodesDispatch({type: 'SET_STORYNODES', payload: nodes});
        }
        fetchData();
    }, [nodesDispatch]);

    return ( 
        <div className="container">
            <AddSidebar />
            <div className = "content">
                <div className="listHeader">
                    <h2>Current Stories:</h2>
                </div>
                {(listNodes) && listNodes.map((story) => (
                    <Storynode
                    storynodeData={story}
                    buttonType='delete'
                    key={story._id} />
                ))}
            </div>
            <AddSidebar />
        </div>
     );
}
 
export default Stories;