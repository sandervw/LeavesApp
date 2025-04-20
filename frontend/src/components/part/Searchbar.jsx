import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from "../../hooks/useAPI";

const Searchbar = () => {
    const navigate = useNavigate();
    const apiCall = useAPI();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [userElements, setUserElements] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const storynodes = await apiCall('fetchElements', 'storynodes', '');
            const templates = await apiCall('fetchElements', 'templates', '');
            setUserElements([...storynodes, ...templates]);
        };
        fetchData();
    }, [apiCall]);

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
            {filteredResults.length > 0 && (
                <div className='dropdown'>
                    <ul>
                        {filteredResults.map((result, index) => (
                            <li key={index}
                                onClick={() => goToResult(result)}
                                >{result.kind}: {result.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Searchbar;