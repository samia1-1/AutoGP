import { Outlet } from 'react-router-dom';
import './App.scss';
import TopBar from '@/components/TopBar';
import { useEffect } from 'react';
import CryptoDebugger from '@/utils/cryptoDebugger';
import DebugConsole from './utils/debugConsole';

const App = () => {
  // 初始化全局调试工具
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 确保RSADebugger在全局可用
      window['RSADebugger'] = CryptoDebugger;
      
      // 输出提示
      console.log('🔧 RSA调试工具已加载，可在控制台使用RSADebugger进行测试');
    }
  }, []);
  
  return (
    <div className="mainApp">
      <div>
        <TopBar />
      </div>
      <Outlet />
      {/* 只在开发环境启用调试控制台 */}
      {process.env.NODE_ENV !== 'production' && <DebugConsole />}
    </div>
  );
}

export default App;
