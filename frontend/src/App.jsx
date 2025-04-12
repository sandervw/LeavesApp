import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthContext from './hooks/useAuthContext';
import { DndContext } from '@dnd-kit/core';
import { PointerSensor, useSensor } from '@dnd-kit/core';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Stories from './pages/Stories';
import Archive from './pages/Archive';
import Templates from './pages/Templates';
import TemplateDetail from './components/TemplateDetail';
import StorynodeDetail from './components/StorynodeDetail';

function App() {

  //TODO - add loading screen while checking auth status
  const { user } = useAuthContext();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('Drag ended:', active, 'over:', over);
    if (over) {
      const method = over.data.current.method;
      const data = active.data.current;
      over.data.current.function(method, data);
    }
  };

  return (
    <div className="App">
      <Router>
        <DndContext onDragEnd={handleDragEnd} sensors={[pointerSensor]}>
          <Navbar />
          <Routes>
            <Route path="/" element={user ? <Stories /> : <Navigate to="/landing" />} />
            <Route path='/templates' element={user ? <Templates /> : <Navigate to="/landing" />} />
            <Route path='/archive' element={user ? <Archive /> : <Navigate to="/landing" />} />
            <Route path='/storydetail' element={user ? <StorynodeDetail /> : <Navigate to="/landing" />} />
            <Route path='/templatedetail' element={user ? <TemplateDetail /> : <Navigate to="/landing" />} />
            <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/" />} />
          </Routes>
        </DndContext>
      </Router>
    </div>
  );
}

export default App;
