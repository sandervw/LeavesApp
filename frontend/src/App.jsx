import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StorynodesContextProvider } from './context/StorynodesContext';
import { TemplatesContextProvider } from './context/TemplatesContext';
import { AuthContextProvider } from './context/AuthContext';
import { DndContext } from '@dnd-kit/core';
import Navbar from './components/Navbar';
import AddSidebar from './components/AddSidebar';
import LinkSidebar from './components/LinkSidebar';
import Stories from './pages/Stories';
import Archive from './pages/Archive';
import Templates from './pages/Templates';
import TemplateDetail from './components/TemplateDetail';
import StorynodeDetail from './components/StorynodeDetail';
import LeafDetail from './components/LeafDetail';

//TODO implement handleDragEnd function here, then just pass the callback inside the event
const handleDragEnd = (event) => {
  const { active, over } = event;
  console.log('Drag ended:', active, 'over:', over);
  if (over && over.id === 'droppable') active.data.function();
}

function App() {
  return (
    <div className="App">
      <Router>
        <AuthContextProvider>
          <DndContext onDragEnd={handleDragEnd}>
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
          </DndContext>
        </AuthContextProvider>
      </Router>
    </div>

  );
}

export default App;
