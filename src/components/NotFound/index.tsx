import { useNavigate } from 'react-router-dom';
import './index.scss'

const NotFound = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/'); // 点击按钮返回首页
  };

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Oops! Page not found.</h2>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <button onClick={handleBackToHome} className="back-home-button">
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
