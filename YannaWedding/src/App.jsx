import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AttendingGuests from './pages/AttendingGuests';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/attending-guests" element={
          <ProtectedRoute>
            <AttendingGuests />
          </ProtectedRoute>
        } />
      </Routes>
 
  );
}

export default App;
