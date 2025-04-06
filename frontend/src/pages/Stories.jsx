import Storynode from "../components/Storynode";
import Droppable from "../components/Droppable";
import AddSidebar from '../components/AddSidebar';
import LinkSidebar from '../components/LinkSidebar';
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
            <AddSidebar kind="templates" type="root" />
        </>
    );
};

export default Stories;