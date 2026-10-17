import { useState, useEffect } from 'react';
import App from './App';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import CookiePolicy from './components/Legal/CookiePolicy';
import TermsOfUse from './components/Legal/TermsOfUse';

export default function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Intercepta cliques em links internos para não recarregar a página
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/') && !target.getAttribute('href')?.startsWith('/api')) {
        e.preventDefault();
        const to = target.getAttribute('href')!;
        window.history.pushState({}, '', to);
        setPath(to);
        window.scrollTo(0, 0);
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (path === '/privacidade') return <PrivacyPolicy />;
  if (path === '/cookies') return <CookiePolicy />;
  if (path === '/termos') return <TermsOfUse />;
  if (path === '/app') return <App />;
  
  return <LandingPage />;
}
