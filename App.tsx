import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import InfoPage from './components/InfoPage';
import { AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Handle browser back button basic support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.view) {
            setCurrentView(event.state.view);
        } else {
            setCurrentView('landing');
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (view: AppView) => {
      window.history.pushState({ view }, '', `#${view}`);
      setCurrentView(view);
      window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'auth':
        return <AuthPage onLogin={() => navigate('dashboard')} onBack={() => navigate('landing')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'updates':
      case 'blog':
      case 'guide':
      case 'support':
      case 'api':
      case 'privacy':
      case 'terms':
        return <InfoPage view={currentView} onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased text-gray-900 bg-gray-50 h-full">
        {renderView()}
      </div>
    </ErrorBoundary>
  );
}