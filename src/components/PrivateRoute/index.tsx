import { Route } from 'react-router-dom';  // 导入 Route
import { Modal } from 'antd';  // 使用 Ant Design 提示框

const PrivateRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem('token');  // 从 localStorage 获取 token

  const showLoginModal = () => {
    Modal.warning({
      title: '未登录',
      content: '请登陆后使用完整功能',
    });
  };

  if (!token) {
    showLoginModal();  // 如果没有 token，则弹出提示框
  }

  return (
    <Route
      {...rest}
      element={token ? element : null}  // 如果有 token，渲染目标页面
    />
  );
};

export default PrivateRoute;
