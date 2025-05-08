import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Form } from 'react-router-dom';
import useAuthContext from './hooks/useAuthContext';
import { DndContext } from '@dnd-kit/core';
import { PointerSensor, useSensor } from '@dnd-kit/core';
import { customCollisionDetectionAlgorithm, handleDragEnd } from './services/dndService';
import Landing from './pages/publicPages/Landing';
import Stories from './pages/protectedPages/Stories';
import Archive from './pages/protectedPages/Archive';
import Templates from './pages/protectedPages/Templates';
import TemplateDetail from './pages/protectedPages/TemplateDetail';
import StorynodeDetail from './pages/protectedPages/StorynodeDetail';
import Navbar from './components/layout/Navbar';
import AddSidebar from './components/layout/AddSidebar';
import LinkSidebar from './components/layout/LinkSidebar';
import FormPage from './pages/publicPages/FormPage';

/**
 * Responsible for routing to the different pages of the app.
 * @returns {JSX.Element} The main app component.
 */
function App() {

  const { user } = useAuthContext();

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
            <Route path='/' element={user ? <Stories /> : <Navigate to='/landing' />} />
            <Route path='/templates' element={user ? <Templates /> : <Navigate to='/landing' />} />
            <Route path='/archive' element={user ? <Archive /> : <Navigate to='/landing' />} />
            <Route path='/storydetail' element={user ? <StorynodeDetail /> : <Navigate to='/landing' />} />
            <Route path='/templatedetail' element={user ? <TemplateDetail /> : <Navigate to='/landing' />} />
            <Route path='/landing' element={!user ? <Landing /> : <Navigate to='/' />} />
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
