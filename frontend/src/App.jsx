// src/App.jsx
// Main application layout with adaptive 4-theme styling, animated background effects, top nav, and page routing.

import Navbar from './components/common/Navbar';
import BackgroundEffects from './components/common/BackgroundEffects';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="min-h-screen bg-theme-main text-theme-text flex flex-col selection:bg-theme-accent selection:text-theme-main relative overflow-x-hidden transition-colors duration-300">
      <BackgroundEffects />
      <Navbar />
      <main className="flex-1 relative z-10">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
