import { Route, Routes } from 'react-router-dom';
import './App.css';
import { IntervalProvider } from './context/IntervalContext';
import BasicMenu from './Pages/BasicMenu';
import Dashboard from './Pages/Dashboard';
import Interval from './Pages/Interval';
import Interval3 from './Pages/Interval3';
import IntervalEntry from './Pages/IntervalEntry';
import Login from './Pages/Login';
function App() {
  return (
    <IntervalProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Interval-entry" element={<IntervalEntry />} />
        <Route path="/interval" element={<Interval />} />
        <Route path = "/menu" element = {<BasicMenu/>}/>
        <Route path = "/Interval3" element = {<Interval3/>}/>
      </Routes>
    </IntervalProvider>
  );
}

export default App;
