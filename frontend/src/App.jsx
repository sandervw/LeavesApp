import './App.css'
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton.jsx'
import LogoutButton from '../components/LogoutButton.jsx'

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <h1>Vite + React</h1>
      <div>
        {!isAuthenticated ? (
          <LoginButton/>
        ) : (
          <>
            <h1>Welcome, {user.name}</h1>
            <img src={user.picture} alt="Profile" width="100" style={{ borderRadius: '50%' }} />
            <p>Email: {user.email}</p>
            <LogoutButton/>
          </>
        )}
      </div>
    </>
  )
}

export default App
