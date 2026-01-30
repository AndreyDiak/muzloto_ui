import { StartParamHandler } from './app/context/start-param-handler';
import { TicketUsedSubscription } from './app/context/ticket-used-subscription';
import { RouterProvider } from 'react-router';
import './App.css';
import { router } from './routes';

export const App = () => {
  return (
    <>
      <TicketUsedSubscription />
      <StartParamHandler />
      <RouterProvider router={router} />
    </>
  );
};
