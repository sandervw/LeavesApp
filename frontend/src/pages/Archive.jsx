import Storynode from "../components/Storynode";
import Droppable from "../components/Droppable";
import LinkSidebar from '../components/LinkSidebar';
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import useElementContext from "../hooks/useElementContext";

const Archive = () => {

    const { children: storynodes, dispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        const fetchData = async () => {
            const nodes = await apiCall('fetchElements', 'storynodes', 'type=root&archived=true');
            dispatch({ type: 'SET_CHILDREN', payload: nodes });
            dispatch({ type: 'SET_ELEMENT', payload: null });
        };
        fetchData();
    }, [dispatch, apiCall]);

    return (
        <>
            <LinkSidebar />
            <div className="content container">
                <Droppable id="droppable" className="droppable" >
                    {(storynodes) && storynodes.map((story) => (
                        <Storynode
                            storynodeData={story}
                            buttonType='delete'
                            key={story._id} />
                    ))}

                </Droppable>
            </div>
            <div>
                <span>TODO drop items here to unarchive?</span>
            </div>
        </>
    );
};

export default Archive;