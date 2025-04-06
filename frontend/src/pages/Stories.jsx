import Storynode from "../components/Storynode";
import Droppable from "../components/Droppable";
import { useEffect } from "react";
import { fetchElements } from "../services/apiService";
import useElementContext from "../hooks/useElementContext";

const Stories = () => {

    const { children: storynodes, dispatch } = useElementContext();

    useEffect(() => {
        const fetchData = async () => {
            const nodes = await fetchElements('storynodes', 'type=root&archived=false');
            dispatch({ type: 'SET_CHILDREN', payload: nodes });
            dispatch({ type: 'SET_ELEMENT', payload: null });
        };
        fetchData();
    }, [dispatch]);

    return (
        <Droppable id="droppable" className="droppable" >
        <div className="content container">
            {/* <h2>Current Stories:</h2> */}
            {(storynodes) && storynodes.map((story) => (
                <Storynode
                    storynodeData={story}
                    buttonType='delete'
                    key={story._id} />
            ))}
        </div>
        </Droppable>
    );
};

export default Stories;