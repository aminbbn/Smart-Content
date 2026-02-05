
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import InfoPage from './components/InfoPage';
import Onboarding from './components/Onboarding';
import { AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Simple view navigation without history API to prevent sandbox errors
  const navigate = (view: AppView) => {
      setCurrentView(view);
      window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'auth':
        // Redirect to onboarding after login
        return <AuthPage onLogin={() => navigate('onboarding')} onBack={() => navigate('landing')} />;
      case 'onboarding':
        return <Onboarding onComplete={() => navigate('dashboard')} />;
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
