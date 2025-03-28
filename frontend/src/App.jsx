import './App.css'
import {Routes, Route} from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton.jsx'
import LogoutButton from '../components/LogoutButton.jsx'
import { StorynodesContextProvider } from '../context/storynodesContext.jsx';
import { TemplatesContextProvider } from '../context/templatesContext';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="App">
        {!isAuthenticated ? (
          <LoginButton/>
        ) : (
          <>
            <h1>Welcome, {user.name}</h1>
            <img src={user.picture} alt="Profile" width="100" style={{ borderRadius: '50%' }} />
            <p>Email: {user.email}</p>
            <Navbar />
            <LogoutButton/>
          </>
        )}
        <div className="content">
          <StorynodesContextProvider>
            <TemplatesContextProvider>
              <Routes>
                <Route path='/' element={<LogoutButton />} />
                {/* <Route path='/archive' element={<Archive />} />
                <Route path='/storydetail' element={<StorynodeDetail />} />
                <Route path='/templates' element={<Templates />} />
                <Route path='/prompts' element={<Prompts />} />
                <Route path='/promptchains' element={<Promptchains />} />
                <Route path='/templatedetail' element={<TemplateDetail />} />
                <Route path='/blobdetail' element={<BlobDetail />} />
                <Route path='/promptchaindetail' element={<PromptchainDetail />} /> */}
              </Routes>
            </TemplatesContextProvider>
          </StorynodesContextProvider>
        </div>
    </div>
  )
}

export default App
