import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { StorynodesContextProvider } from '../context/storynodesContext';
import { TemplatesContextProvider } from '../context/templatesContext';
import Stories from '../pages/Stories';
import SyncUserToBackend from '../components/SyncUserToBackend';

function App2() {
  const { isLoading } = useAuth0();

  console.log('App component loaded:', { isLoading });
  

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="App">
      <SyncUserToBackend />
    </div>

  );
}

export default App2;
