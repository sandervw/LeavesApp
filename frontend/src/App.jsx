import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StorynodesContextProvider } from './context/StorynodesContext';
import { TemplatesContextProvider } from './context/TemplatesContext';
import { AuthContextProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AddSidebar from './components/AddSidebar';
import LinkSidebar from './components/LinkSidebar';
import Stories from './pages/Stories';
import Archive from './pages/Archive';
import Templates from './pages/Templates';
import TemplateDetail from './components/TemplateDetail';
import StorynodeDetail from './components/StorynodeDetail';
import LeafDetail from './components/LeafDetail';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthContextProvider>
          <StorynodesContextProvider>
            <TemplatesContextProvider>
              <Navbar />
              <LinkSidebar />
              <Routes>
                <Route path='/' element={<Stories />} />
                <Route path='/archive' element={<Archive />} />
                <Route path='/storydetail' element={<StorynodeDetail />} />
                <Route path='/templates' element={<Templates />} />
                <Route path='/templatedetail' element={<TemplateDetail />} />
                <Route path='/leafdetail' element={<LeafDetail />} />
              </Routes>
              <AddSidebar />
            </TemplatesContextProvider>
          </StorynodesContextProvider>
        </AuthContextProvider>
      </Router>
    </div>

  );
}

export default App;
