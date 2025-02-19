import ReactDOM from 'react-dom/client';
import './index.scss';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import store from './store';
import 'normalize.css';
import './utils/i18n';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Provider } from 'react-redux';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  </>
)
