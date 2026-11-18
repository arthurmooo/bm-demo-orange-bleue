import { createBrowserRouter, RouterProvider } from 'react-router';
import { Shell } from './app/shell/Shell';
import { HomePage } from './app/home/HomePage';
import { SuiviPage } from './app/suivi/SuiviPage';
import { FidelisationPage } from './app/fidelisation/FidelisationPage';
import { ImpayesPage } from './app/impayes/ImpayesPage';
import { MailsPage } from './app/mails/MailsPage';
import { PartenariatsPage } from './app/partenariats/PartenariatsPage';
import { EquipePage } from './app/equipe/EquipePage';

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/suivi', element: <SuiviPage /> },
      { path: '/fidelisation', element: <FidelisationPage /> },
      { path: '/impayes', element: <ImpayesPage /> },
      { path: '/mails', element: <MailsPage /> },
      { path: '/partenariats', element: <PartenariatsPage /> },
      { path: '/equipe', element: <EquipePage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
