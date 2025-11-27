import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from "../../hooks/useAPI";
import useAuthContext from '../../hooks/useAuthContext';
import useTreelistContext from '../../hooks/useTreelistContext';

const Searchbar = () => {
  const navigate = useNavigate();
  const { apiCall } = useAPI();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const { user } = useAuthContext();
  const { trees, dispatch } = useTreelistContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const storynodes = await apiCall('fetchElements', 'storynode', 'type=root');
      const templates = await apiCall('fetchElements', 'template', 'type=root');
      if (!storynodes && !templates) return;
      const treelist = [...storynodes, ...templates].map(tree => ({
        _id: tree._id,
        name: tree.name,
        kind: tree.kind,
        archived: tree.archived
      }));
      dispatch({ type: 'SET_TREES', payload: treelist });
    };
    fetchData();
  }, [apiCall, user, dispatch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value && trees.length > 0) {
      const matches = trees.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
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
  };

  return (
    <>
      <div className='z-nav'>
        <input
          className="input font-large"
          placeholder='Search...'
          value={searchTerm}
          onChange={handleSearch} />
      </div>
      {(user && filteredResults.length > 0) && (
        <div className='floatable revealed'>
          <ul className='list'>
            {filteredResults.map((result, index) => (
              <li className='list-item list-link' key={index}
                onClick={() => goToResult(result)}
              >{result.name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className={filteredResults.length > 0 ? 'modal-backdrop' : ''}></div>
    </>
  );
};

export default Searchbar;