import { Outlet } from 'react-router-dom';
import './App.scss';
import TopBar from '@/components/TopBar'


function App() {
  return (
    <div className="mainApp">
      <div>
        <TopBar />
      </div>
      <Outlet />
    </div>
  );
}

export default App;
