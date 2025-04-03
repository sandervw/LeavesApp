import Storynode from "../components/Storynode";
import { useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useStorynodeContext from "../hooks/useStorynodesContext";

const Archive = () => {

    const {listNodes, dispatch} = useStorynodeContext();

    useEffect(() => {
        const fetchStorynodes = async () => {
            const data = await fetchElements('storynodes', 'type=story&archived=true');
            dispatch({type: 'SET_STORYNODES', payload: data});
        }
        fetchStorynodes();
    }, [dispatch]);

    return ( 
        <div className="container">
            <div className="listHeader">
                <h2>Archived Stories:</h2>
            </div>
            {(listNodes) && listNodes.map((story) => (
                <Storynode
                storynodeData={story}
                buttonType='delete'
                key={story._id} />
            ))}
        </div>
     );
}
 
export default Archive;