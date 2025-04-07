import Storynode from "../components/Storynode";
import Droppable from "../components/Droppable";
import AddSidebar from '../components/AddSidebar';
import LinkSidebar from '../components/LinkSidebar';
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import useElementContext from "../hooks/useElementContext";

const Stories = () => {

    const { children: storynodes, dispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        const fetchData = async () => {
            const nodes = await apiCall('fetchElements', 'storynodes', 'type=root&archived=false');
            dispatch({ type: 'SET_CHILDREN', payload: nodes });
            dispatch({ type: 'SET_ELEMENT', payload: null });
        };
        fetchData();
    }, [dispatch, apiCall]);

    return (
        <>
            <LinkSidebar />
            <Droppable id="droppable" className="content container" >
                {(storynodes) && storynodes.map((story) => (
                    <Storynode
                        storynodeData={story}
                        buttonType='delete'
                        key={story._id} />
                ))}
            </Droppable>
            <AddSidebar page="stories" type="root" />
        </>
    );
};

export default Stories;