import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './lib/ThemeContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
