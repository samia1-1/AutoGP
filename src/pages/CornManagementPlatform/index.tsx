import './index.scss'
import { Outlet, useLocation } from 'react-router-dom';

const Cimp = () => {
  const location = useLocation()
  return (
    <div className='cimp'>
    {location.pathname==="/cimp/china_map" &&
    
    <div className="title">中国历史性品种群体多环境表型的遗传解析</div>
    }
      <Outlet />
    </div>
  );
};

export default Cimp;