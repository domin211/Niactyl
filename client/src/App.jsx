import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import config from './config';
import Auth from './Auth';

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/auth" replace />;
}

function Dashboard({ user }) {
  return (
    <div className="text-center">
      <p className="mb-4 text-xl text-gray-300">Welcome, {user.username}!</p>
      <a href={`${config.apiBase}/logout`} className="underline text-blue-400">
        Logout
      </a>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${config.apiBase}/api/user`)
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Niactyl App</h1>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
          />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
