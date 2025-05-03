import './App.css';

import { Route, Routes } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the Home page!</p>
    </div>
  );
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
