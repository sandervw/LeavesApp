import './App2.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { StorynodesContextProvider } from '../context/storynodesContext';
import { TemplatesContextProvider } from '../context/templatesContext';
import Stories from '../pages/Stories';

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="App">
      <Router>
        <Navbar />
        <div className="main-container">
          <div className="sidebar">
            <button className="create-story-btn">+ Create New Story</button>
          </div>
          <div className="content">
            <StorynodesContextProvider>
              <TemplatesContextProvider>
                <Routes>
                  <Route path='/' element={<Stories />} />
                </Routes>
              </TemplatesContextProvider>
            </StorynodesContextProvider>
          </div>
        </div>
      </Router>
    </div>

  );
}

export default App;
