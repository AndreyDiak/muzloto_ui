import { RouterProvider } from 'react-router';
import './App.css';
import { router } from './routes';

export const App = () => {
  return <RouterProvider router={router} />;
};
