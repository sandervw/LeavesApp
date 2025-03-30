import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StorynodesContextProvider } from '../context/storynodesContext';
import { TemplatesContextProvider } from '../context/templatesContext';
import Navbar from '../components/Navbar';
import Stories from '../pages/Stories';
import Archive from '../pages/Archive';
import Templates from '../pages/Templates';
import TemplateDetail from '../components/TemplateDetail';
import StorynodeDetail from '../components/StorynodeDetail';
import LeafDetail from '../components/LeafDetail';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <StorynodesContextProvider>
          <TemplatesContextProvider>
            <Routes>
              <Route path='/' element={<Stories />} />
              <Route path='/archive' element={<Archive />} />
              <Route path='/storydetail' element={<StorynodeDetail />} />
              <Route path='/templates' element={<Templates />} />
              <Route path='/templatedetail' element={<TemplateDetail />} />
              <Route path='/leafdetail' element={<LeafDetail />} />
            </Routes>
          </TemplatesContextProvider>
        </StorynodesContextProvider>
      </Router>
    </div>

  );
}

export default App;
