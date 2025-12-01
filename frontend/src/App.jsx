import './sparse.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { PointerSensor, useSensor } from '@dnd-kit/core';
import { customCollisionDetectionAlgorithm, handleDragEnd } from './config/dndConfig';
import AuthContainer from './components/wrapper/AuthContainer';
import Landing from './pages/publicPages/Landing';
import Stories from './pages/protectedPages/Stories';
import Archive from './pages/protectedPages/Archive';
import Templates from './pages/protectedPages/Templates';
import TemplateDetail from './pages/protectedPages/TemplateDetail';
import StorynodeDetail from './pages/protectedPages/StorynodeDetail';
import FormPage from './pages/publicPages/FormPage';
import Navbar from './components/layout/Navbar';
import AddSidebar from './components/layout/AddSidebar';
import LinkSidebar from './components/layout/LinkSidebar';

/**
 * Component that routes to different pages
 * Adds a drag-and-drop context
 * Wraps protected pages in an authentication container
 */
function App() {
  const [activeItem, setActiveItem] = useState(null);

  // Only start drag after pointer has moved 10 pixels (prevents accidental drags from clicks)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  // Used to create a copy of an item (ActiveItem) when dragging starts, for display
  const handleDragStart = (event) => {
    setActiveItem(event.active.data.current?.element);
  };
  const onDragEnd = (event) => {
    handleDragEnd(event);
    setActiveItem(null);
  };

  return (
    <Router>
      <DndContext onDragStart={handleDragStart} onDragEnd={onDragEnd} sensors={[pointerSensor]} collisionDetection={customCollisionDetectionAlgorithm}>
        <div className="app-layout">
          <Navbar />
          <div className="app-content">
            <LinkSidebar />
            {/* Protected routes */}
            <Routes>
              <Route path='/' element={<AuthContainer />}>
                <Route index element={<Stories />} />
                <Route path='/stories' element={<Stories />} />
                <Route path='/templates' element={<Templates />} />
                <Route path='/archive' element={<Archive />} />
                <Route path='/storydetail/' element={<StorynodeDetail />} />
                <Route path='/templatedetail/' element={<TemplateDetail />} />
              </Route>
              {/* Unprotected routes */}
              <Route path='/landing' element={<Landing />} />
              <Route path='/signup' element={<FormPage formType='signup' />} />
              <Route path='/login' element={<FormPage formType='login' />} />
              <Route path='/password/forgot' element={<FormPage formType={'forgot'} />} />
              <Route path='/password/reset' element={<FormPage formType='reset' />} />
              <Route path='/email/verify/:code' element={<FormPage formType='verify' />} />
            </Routes>
            <AddSidebar />
          </div>
        </div>
        {/* Active drag item displays here, over everything else */}
        <DragOverlay>
          {activeItem ? <div className="card container">{activeItem.name}</div> : null}
        </DragOverlay>
      </DndContext>
    </Router>
  );

}

export default App;
