import { useEffect } from "react";
import { Modal } from 'antd';
import { getToken } from './token';
import { useNavigate } from "react-router-dom";

export function RequireAuth({ children }) {
  const token = getToken();  // 获取 token
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // 弹出提示框
      Modal.confirm({
        title: 'Not logged in',
        content: 'After login, you can use the full function. Do you want to log in?',
        okText: 'OK',
        cancelText: 'Cancel',
        onOk() {
          navigate('/login');
        },
        onCancel() {
          // 只弹出提示框，不做跳转
        }
      });
    }
  }, [token]);

  // 即使没有 token 也继续渲染 children
  return children;
}
