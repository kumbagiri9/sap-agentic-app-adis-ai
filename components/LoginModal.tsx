
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface LoginModalProps {
  role: UserRole;
  onSuccess: () => void;
  isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ role, onSuccess, isOpen }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens for a new role
  useEffect(() => {
    if (isOpen) {
      setUsername(`S4_${role.toUpperCase().replace(' ', '_')}_USER`);
      setPassword('');
      setError('');
    }
  }, [isOpen, role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Active Directory Authentication Latency
    setTimeout(() => {
      if (password.length >= 4) {
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setError('Active Directory Authentication Failed: Invalid credentials for the requested role profile.');
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-[#002f5a] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
              <i className="fas fa-shield-halved text-blue-400 text-xl"></i>
            </div>
            <div>
              <h2 className="font-black text-sm uppercase tracking-widest">Identity Access</h2>
              <p className="text-[10px] text-blue-300 font-bold uppercase">SAP Security Layer (AD Sync)</p>
            </div>
          </div>
          <div className="text-[10px] font-black bg-blue-900 px-2 py-1 rounded border border-blue-700">
            {role}
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Corporate ID</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  placeholder="domain\user"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">AD Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2">
              <i className="fas fa-circle-exclamation text-red-500 mt-0.5"></i>
              <p className="text-[10px] font-bold text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#002f5a] hover:bg-blue-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-3"></i>
                Authenticating AD...
              </>
            ) : (
              'Verify Identity'
            )}
          </button>

          <div className="text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Secured by Active Directory Federated Services
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
