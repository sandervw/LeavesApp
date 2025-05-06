import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthContext from './hooks/useAuthContext';
import { DndContext } from '@dnd-kit/core';
import { PointerSensor, useSensor } from '@dnd-kit/core';
import { customCollisionDetectionAlgorithm, handleDragEnd } from './services/dndService';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Stories from './pages/Stories';
import Archive from './pages/Archive';
import Templates from './pages/Templates';
import TemplateDetail from './pages/TemplateDetail';
import StorynodeDetail from './pages/StorynodeDetail';
import AddSidebar from './components/layout/AddSidebar';
import LinkSidebar from './components/layout/LinkSidebar';
import VerifyEmail from './pages/VerifyEmail';

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
            <Route path='/email/verify/:code' element={<VerifyEmail />} />
          </Routes>
          <AddSidebar />
        </DndContext>
      </Router>
    </div>
  );

}

export default App;
