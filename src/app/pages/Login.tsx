import { useState } from 'react';
import { useNavigate } from 'react-router';
import logoPng from '../../media/logo.png';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { AUTH_KEY, USERNAME_KEY } from '../lib/useAuth';
import packageInfo from '../../../package.json';

export function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, ingresa tu nombre para continuar');
      return;
    }

    localStorage.setItem(USERNAME_KEY, username.trim());
    localStorage.setItem(AUTH_KEY, 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-all duration-500">
      {/* Theme toggle en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-transparent dark:border-gray-800 transition-all duration-300">
        <div className="text-center mb-8">
          <img src={logoPng} alt="Exposite logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenid@ a Exposite</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Ingresa tu nombre para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Docente
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ingresa tu nombre"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
      {/* Footer */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full text-center opacity-40 hover:opacity-100 transition-opacity duration-500 px-4">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">
          © 2026 Alejandro Balderas Rios
        </p>
        <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
          Prohibida la reproducción total o parcial sin autorización.
        </p>
      </footer>
      <div className="fixed bottom-4 right-4 text-[10px] font-mono text-gray-400 opacity-50">
        v{packageInfo.version}
      </div>
    </div>
  );
}