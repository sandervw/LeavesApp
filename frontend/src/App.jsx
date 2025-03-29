import './App.css';
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
          <aside className="sidebar">
            <div className="sidebar-content">
              <h2>Sidebar</h2>
              <p>Links or other content can go here.</p>
            </div>
            <div className="sidebar-content">
              <h2>Story Lineage</h2>
              <p>Story Title</p>
              <p>..Act Title</p>
              <p>....Chapter Title</p>
              <p>......Scene Title</p>
            </div>
          </aside>
          <div className="content">
            <StorynodesContextProvider>
              <TemplatesContextProvider>
                <Routes>
                  <Route path='/' element={<Stories />} />
                </Routes>
              </TemplatesContextProvider>
            </StorynodesContextProvider>
          </div>
          <aside className="sidebar">
            <button className="create-story-btn">+ Create New Story</button>
          </aside>
        </div>
      </Router>
    </div>

  );
}

export default App;
