import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import config from './config';

function Home({ message, user }) {
  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <div className="text-center">
      <p className="mb-4 text-xl text-gray-300">{message}</p>
      <a
        href="/auth/discord"
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        Login with Discord
      </a>
    </div>
  );
}

function Dashboard({ user }) {
  return (
    <div className="text-center">
      <p className="mb-4 text-xl text-gray-300">Welcome, {user.username}!</p>
      <a href="/logout" className="underline text-blue-400">Logout</a>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState('Loading...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${config.apiBase}/api/message`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setMessage('Error fetching message');
      });
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
          <Route path="/" element={<Home message={message} user={user} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
