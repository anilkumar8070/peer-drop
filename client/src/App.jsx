import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// We will create Room.jsx in the next step
import Room from './pages/Room'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;