import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import MainDashboard from './components/Dashboard/MainDashboard';
import useRealtime from './hooks/useRealtime';
import useEventStore from './store/eventStore';

function App() {
  const { theme, login } = useEventStore();
  useRealtime();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Simulate login for demo
  useEffect(() => {
    login({
      id: 'user-1',
      name: 'Event Manager',
      email: 'manager@event.com',
      role: 'admin'
    });
  }, [login]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-[1920px]">
        <MainDashboard />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))'
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--success))',
              secondary: 'white'
            }
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--danger))',
              secondary: 'white'
            }
          }
        }}
      />
    </div>
  );
}

export default App;
