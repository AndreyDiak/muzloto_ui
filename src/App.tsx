import { TicketUsedSubscription } from './app/context/ticket-used-subscription';
import { RouterProvider } from 'react-router';
import './App.css';
import { router } from './routes';

export const App = () => {
  return (
    <>
      <TicketUsedSubscription />
      <RouterProvider router={router} />
    </>
  );
};
