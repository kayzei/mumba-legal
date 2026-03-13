import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { firmService } from '../services/firmService';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, User } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: '',
    agreedToTerms: false
  });

  React.useEffect(() => {
    if (profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: formData.displayName,
      role: 'client' as const,
      kycStatus: 'pending' as const,
      phoneNumber: formData.phoneNumber,
      createdAt: new Date().toISOString()
    };

    await firmService.createUserProfile(newProfile);
    window.location.reload(); // Refresh to update profile in context
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl text-midnight mb-2 tracking-wide">Client Onboarding</h1>
          <p className="text-midnight/50 uppercase tracking-widest text-xs">Mumba & Partners Legal Practitioners</p>
        </div>

        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-midnight/10 -z-10" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-500 ${
                step >= s ? 'bg-midnight border-midnight text-champagne' : 'bg-paper border-midnight/10 text-midnight/30'
              }`}
            >
              {s === 1 && <User size={18} />}
              {s === 2 && <ShieldCheck size={18} />}
              {s === 3 && <FileText size={18} />}
            </div>
          ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="prestige-card p-10 border-t-4 border-t-champagne"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-midnight">Personal Particulars</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-midnight/50 mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-paper border border-midnight/10 p-3 font-serif focus:outline-none focus:border-champagne"
                    placeholder="As per Identity Document"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-midnight/50 mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-paper border border-midnight/10 p-3 font-serif focus:outline-none focus:border-champagne"
                    placeholder="+260 ..."
                  />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="gold-button w-full mt-6">Continue to KYC</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-midnight">KYC & Compliance</h2>
              <p className="text-sm text-midnight/60 leading-relaxed">
                As a regulated legal firm, we are required to verify your identity. 
                Please note that your access to certain legal services will be restricted until your KYC status is 'Verified'.
              </p>
              <div className="p-4 bg-midnight/5 border-l-2 border-champagne italic text-sm">
                "We uphold the highest standards of professional confidentiality and data protection."
              </div>
              <button onClick={() => setStep(3)} className="gold-button w-full mt-6">Review Terms</button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-serif text-2xl text-midnight">Declaration</h2>
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                    className="mt-1 accent-champagne"
                  />
                  <span className="text-sm text-midnight/70">
                    I hereby declare that the information provided is true and correct. I agree to the terms of engagement and the firm's privacy policy.
                  </span>
                </label>
              </div>
              <button 
                type="submit" 
                disabled={!formData.agreedToTerms}
                className="gold-button w-full mt-6 disabled:opacity-50"
              >
                Complete Registration
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
