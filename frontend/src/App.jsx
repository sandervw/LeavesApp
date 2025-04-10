import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ElementContextProvider } from './context/ElementContext';
import { AddableContextProvider } from './context/AddableContext';
import { AuthContextProvider } from './context/AuthContext';
import { DndContext } from '@dnd-kit/core';
import {PointerSensor, useSensor} from '@dnd-kit/core';
import Navbar from './components/layout/Navbar';
import Stories from './pages/Stories';
import Archive from './pages/Archive';
import Templates from './pages/Templates';
import TemplateDetail from './components/TemplateDetail';
import StorynodeDetail from './components/StorynodeDetail';

const handleDragEnd = (event) => {
  const { active, over } = event;
  console.log('Drag ended:', active, 'over:', over);
  if (over){
    const method = active.data.current.method;
    const data = active.data.current.element;
    over.data.current.function(method, data);
  } 
}

function App() {
  
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  return (
    <div className="App">
      <Router>
        <AuthContextProvider>
          <DndContext onDragEnd={handleDragEnd} sensors={[pointerSensor]}>
            <ElementContextProvider>
              <AddableContextProvider>
                <Navbar />
                <Routes>
                  <Route path='/' element={<Stories />} />
                  <Route path='/archive' element={<Archive />} />
                  <Route path='/storydetail' element={<StorynodeDetail />} />
                  <Route path='/templates' element={<Templates />} />
                  <Route path='/templatedetail' element={<TemplateDetail />} />
                </Routes>
              </AddableContextProvider>
            </ElementContextProvider>
          </DndContext>
        </AuthContextProvider>
      </Router>
    </div>
  );
}

export default App;
