import { Route, Routes } from 'react-router-dom';
import './App.css';
import { IntervalProvider } from './context/IntervalContext';
import BasicMenu from './Pages/BasicMenu';
import Dashboard from './Pages/Dashboard';
import Interval from './Pages/Interval';
import Interval3 from './Pages/Interval3';
import IntervalEntry from './Pages/IntervalEntry';
import Login from './Pages/Login';
import PlatformSelect from './Pages/PlatformSelect';
import YouTubeIntervalSetup from './Pages/YouTubeIntervalSetup';
import YouTubePlayerPage from './Pages/YouTubePlayerPage';
import YouTubeSearch from './Pages/YouTubeSearch';
function App() {
  return (
    <IntervalProvider>
      <Routes>
        
      <Route path="/" element={<PlatformSelect />} />
      <Route path="/youtubeIntervalSetup" element={<YouTubeIntervalSetup />} />
      <Route path="/youtubePlayer" element={<YouTubePlayerPage />} />

      <Route path="/youtubeSearch" element={<YouTubeSearch />} />
      <Route path="/spotifyLogin" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Interval-entry" element={<IntervalEntry />} />
        <Route path="/interval" element={<Interval />} />
        <Route path = "/menu" element = {<BasicMenu />}/>
        <Route path = "/Interval3" element = {<Interval3 />}/>
      </Routes>
    </IntervalProvider>
  );
}

export default App;
