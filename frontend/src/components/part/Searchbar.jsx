import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from "../../hooks/useAPI";
import useAuthContext from '../../hooks/useAuthContext';

const Searchbar = () => {
    const navigate = useNavigate();
    const { apiCall } = useAPI();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [userElements, setUserElements] = useState([]);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            const storynodes = await apiCall('fetchElements', 'storynode', 'type=root&archived=false');
            const templates = await apiCall('fetchElements', 'template', 'type=root');
            if (!storynodes || !templates) return;
            setUserElements([...storynodes, ...templates]);
        };
        fetchData();
    }, [apiCall, user]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value && userElements.length > 0) {
            const matches = userElements.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredResults(matches);
        } else {
            setFilteredResults([]);
        }
    };

    const goToResult = (result) => {
        if (result.kind === 'storynode') {
            navigate(`/storydetail`, { state: result._id });
        } else if (result.kind === 'template') {
            navigate('/templatedetail', { state: result._id });
        }
        setSearchTerm('');
        setFilteredResults([]);
    }

    return (
        <div className='search'>
            <input
                placeholder='Search Stories and Templates'
                value={searchTerm}
                onChange={handleSearch} />
            {(user && filteredResults.length > 0) && (
                <div className='dropdown'>
                    <ul>
                        {filteredResults.map((result, index) => (
                            <li key={index}
                                onClick={() => goToResult(result)}
                                >{result.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Searchbar;