export function tokenLoss(pathname) {
  // 弹出提示
  alert('您的会话已过期，请重新登录。');
  // 清除本地存储并重定向
  localStorage.clear();
  localStorage.setItem("pathname",pathname)
  window.location.href = '/login';
};
