import { useEffect, useState } from 'react';
import useAPI from "../../hooks/useAPI";

const Searchbar = () => {
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
            const namesAndKinds = userElements.map(({name, kind}) => ({name, kind}));
            const matches = namesAndKinds.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
            const results = matches.map(match => `${match.kind}: ${match.name}`);
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
    };

    return (
        <div className='search'>
            <input 
                placeholder='Search Stories and Templates'
                value={searchTerm}
                onChange={handleSearch} />
            {filteredResults.length > 0 && (
                <ul className='dropdown'>
                    {filteredResults.map((result, index) => (
                        <li key={index}>{result}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Searchbar;