import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (user && !loading) {
      if (!profile) {
        navigate('/onboarding');
      } else {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full border border-champagne" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full border border-champagne" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-12 bg-white/5 backdrop-blur-xl border border-white/10 text-center relative z-10"
      >
        <div className="mb-12">
          <h1 className="font-serif text-4xl tracking-[0.2em] text-champagne uppercase mb-2">Mumba & Partners</h1>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Legal Practitioners</p>
        </div>

        <div className="mb-12 space-y-4">
          <h2 className="font-serif text-2xl text-white italic">Private Client Gateway</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Welcome to the exclusive digital portal of Mumba & Partners. 
            Access your legal matters, secure documents, and direct counsel messaging.
          </p>
        </div>

        <button 
          onClick={handleSignIn}
          disabled={loading}
          className="w-full gold-button py-4 text-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Enter Portal'}
        </button>

        <p className="text-[10px] uppercase tracking-widest text-white/30">
          Secure Multi-Factor Authentication Required
        </p>
      </motion.div>

      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">
          LUSAKA • LONDON • DUBAI
        </p>
      </div>
    </div>
  );
};

export default Login;
