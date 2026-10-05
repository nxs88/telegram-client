import { useMemo, useState } from 'react';
import { GreenApiClient } from './api/greenApi';
import { GreenApiProvider } from './context/GreenApiContext';
import LoginPage from './pages/LoginPage/LoginPage';
import ChatPage from './pages/ChatPage/ChatPage';
import './App.css';

interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const client = useMemo(() => {
    if (!credentials) return null;

    return new GreenApiClient({
      apiUrl: import.meta.env.VITE_GREEN_API_URL,
      idInstance: credentials.idInstance,
      apiTokenInstance: credentials.apiTokenInstance,
    });
  }, [credentials]);

  if (!credentials || !client) {
    return <LoginPage onLogin={setCredentials} />;
  }

  return (
    <GreenApiProvider client={client} idInstance={credentials.idInstance}>
      <ChatPage onLogout={() => setCredentials(null)} />
    </GreenApiProvider>
  );
}

export default App;
