import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Form } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { PointerSensor, useSensor } from '@dnd-kit/core';
import { customCollisionDetectionAlgorithm, handleDragEnd } from './services/dndService';
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
 * Responsible for routing to the different pages of the app.
 */
function App() {

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  return (
    <div className='App'>
      <Router>
        <DndContext onDragEnd={handleDragEnd} sensors={[pointerSensor]} collisionDetection={customCollisionDetectionAlgorithm}>
          <Navbar />
          <LinkSidebar />
          <Routes>
            <Route path='/' element={<AuthContainer />}>
              <Route index element={<Stories />} />
              <Route path='/templates' element={<Templates />} />
              <Route path='/archive' element={<Archive />} />
              <Route path='/storydetail/' element={<StorynodeDetail />} />
              <Route path='/templatedetail/' element={<TemplateDetail />} />
            </Route>
            <Route path='/landing' element={<Landing />} />
            <Route path='/signup' element={<FormPage formType='signup' />} />
            <Route path='/login' element={<FormPage formType='login' />} />
            <Route path='/password/forgot' element={<FormPage formType={'forgot'} />} />
            <Route path='/password/reset' element={<FormPage formType='reset' />} />
            <Route path='/email/verify/:code' element={<FormPage formType='verify' />} />
          </Routes>
          <AddSidebar />
        </DndContext>
      </Router>
    </div>
  );

}

export default App;
