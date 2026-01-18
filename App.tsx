
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { authService } from './services/authService';
import { AuthState, UserRole } from './types';

declare global {
  interface Window {
    google: any;
  }
}

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(authService.getAuthState());
  const [view, setView] = useState<string>('home');
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  // Note: For a real app, this must be your actual Client ID from Google Cloud Console.
  const GOOGLE_CLIENT_ID = "1056345601952-vcl2089456v2l892345v2l892345v2l8.apps.googleusercontent.com";

  useEffect(() => {
    if (auth.isAuthenticated) {
      setView(auth.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-dashboard');
    } else if (!['admin-login', 'login-selection'].includes(view)) {
      setView('home');
    }
  }, [auth]);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCredentialResponse = (response: any) => {
    setIsLoggingIn(true);
    try {
      const payload = decodeJwt(response.credential);
      if (payload) {
        const result = authService.loginWithGoogle(
          payload.email,
          payload.name,
          payload.picture
        );
        setAuth(result);
      }
    } catch (err) {
      console.error("Login failed", err);
      setError("Google authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && googleButtonDiv.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          googleButtonDiv.current,
          { theme: "outline", size: "large", width: 250 }
        );
      }
    };

    const timer = setTimeout(initializeGoogle, 1000);
    return () => clearTimeout(timer);
  }, [view]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authService.loginAdmin(adminForm.email, adminForm.password);
    if (result) {
      setAuth(result);
      setError(null);
    } else {
      setError('Invalid admin credentials.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAuth({ role: UserRole.GUEST, isPaid: false, isAuthenticated: false });
    setView('home');
  };

  const renderView = () => {
    if (isLoggingIn) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900">Signing you in...</h2>
        </div>
      );
    }

    switch (view) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto px-4 py-24 md:py-40 text-center">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-1.5 rounded-full mb-8 border border-indigo-100">
               <span className="text-indigo-600 text-[11px] font-black uppercase tracking-widest">Premium Study Network</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-none">
              Notes just for you!
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
              Secure, organized, and available anywhere. Sign in with Google to access your premium vault.
            </p>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div ref={googleButtonDiv}></div>
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
              <button 
                onClick={() => setView('admin-login')}
                className="text-gray-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] transition mt-4"
              >
                — Staff Access Portal —
              </button>
            </div>
          </div>
        );

      case 'login-selection':
        return (
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-center">
              <div className="mb-10">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <i className="fas fa-lock text-2xl"></i>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Secure Access</h2>
                <p className="text-gray-400 font-medium mt-2">Sign in to your account</p>
              </div>
              <div className="flex justify-center mb-10">
                <div ref={googleButtonDiv}></div>
              </div>
              <button 
                onClick={() => setView('admin-login')} 
                className="w-full py-4 border-t border-gray-50 text-xs font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition"
              >
                Staff Administrator Login
              </button>
            </div>
          </div>
        );

      case 'admin-login':
        return (
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-shield text-xl"></i>
              </div>
              <h2 className="text-2xl font-black mb-8 text-center text-gray-900">Admin Vault</h2>
              {error && <p className="text-red-500 text-center mb-4 font-bold text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Admin Identity</label>
                  <input 
                    type="email" required
                    className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="email@notevault.in"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure Passkey</label>
                  <input 
                    type="password" required
                    className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg mt-4">
                  Authenticate Access
                </button>
              </form>
              <button onClick={() => setView('login-selection')} className="w-full text-gray-400 mt-8 text-[10px] font-bold uppercase tracking-widest">
                Return to Student Sign In
              </button>
            </div>
          </div>
        );

      case 'admin-dashboard': return <AdminDashboard />;
      case 'user-dashboard': return <UserDashboard auth={auth} onPaymentSuccess={() => setAuth(authService.updatePaymentStatus(true)!)} />;
      default: return <div>Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdff]">
      <Header auth={auth} onLogout={handleLogout} onNavigate={setView} />
      <main className="flex-1 flex flex-col">{renderView()}</main>
      
      {/* Footer link for admin access always available */}
      {!auth.isAuthenticated && (
        <footer className="py-8 text-center">
          <button 
            onClick={() => setView('admin-login')}
            className="text-gray-300 hover:text-gray-500 text-[9px] uppercase tracking-[0.5em] transition"
          >
            Management Portal
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
