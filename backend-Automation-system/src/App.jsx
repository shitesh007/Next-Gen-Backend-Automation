import { useState } from 'react';
import HeroSection from './components/ui/HeroSection';
import Sidebar from './components/layout/Sidebar';
import PromptEngine from './components/PromptEngine';

export default function App() {
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);

  if (!started) {
    return <HeroSection onStart={() => setStarted(true)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        history={history}
        onNew={() => {}}
        onSelect={(item) => {}}
      />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <PromptEngine />
      </main>
    </div>
  );
}
