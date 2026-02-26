import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GroupView } from './pages/GroupView';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/group/:groupId',
    Component: GroupView,
  },
]);