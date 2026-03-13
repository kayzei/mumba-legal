import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { firmService } from '../services/firmService';
import { Matter } from '../types';
import { Briefcase, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      const unsubscribe = firmService.subscribeToMatters(profile.uid, (data) => {
        setMatters(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [profile]);

  if (loading) {
    return <div className="animate-pulse font-serif text-xl">Loading matters...</div>;
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl text-midnight mb-2">Welcome, {profile?.displayName?.split(' ')[0]}</h2>
          <p className="text-midnight/50 font-serif italic">Your active legal portfolio at Mumba & Partners.</p>
        </div>
        <Link to="/bookings" className="gold-button inline-flex items-center space-x-2">
          <span>New Consultation</span>
        </Link>
      </header>

      {matters.length === 0 ? (
        <div className="prestige-card p-20 text-center border-dashed border-2 border-midnight/10">
          <Briefcase className="mx-auto text-midnight/10 mb-6" size={48} />
          <h3 className="font-serif text-2xl text-midnight mb-2">No Active Matters</h3>
          <p className="text-midnight/50 max-w-md mx-auto mb-8">
            You currently have no active legal matters registered in the portal. 
            Schedule a consultation with one of our departments to begin.
          </p>
          <Link to="/bookings" className="gold-button">Book Consultation</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {matters.map((matter, index) => (
            <motion.div 
              key={matter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/matters/${matter.id}`}
                className="group block prestige-card p-8 hover:border-champagne transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Briefcase size={80} />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-champagne font-bold mb-1 block">
                      {matter.department}
                    </span>
                    <h3 className="font-serif text-2xl text-midnight group-hover:text-champagne transition-colors">
                      {matter.title}
                    </h3>
                  </div>
                  <div className={`px-3 py-1 text-[10px] uppercase tracking-widest border ${
                    matter.status === 'Open' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                    matter.status === 'In Progress' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                    'border-amber-200 text-amber-600 bg-amber-50'
                  }`}>
                    {matter.status}
                  </div>
                </div>

                <p className="text-sm text-midnight/60 line-clamp-2 mb-8 font-serif italic">
                  {matter.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-midnight/5">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-midnight/40">
                      <Clock size={14} />
                      <span className="text-[10px] uppercase tracking-wider">
                        Updated {new Date(matter.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {matter.nextCourtDate && (
                      <div className="flex items-center space-x-2 text-amber-600">
                        <AlertCircle size={14} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                          Court: {new Date(matter.nextCourtDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="text-midnight/20 group-hover:text-champagne group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Stats / Info Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="prestige-card p-6 bg-midnight text-white">
          <h4 className="font-serif text-lg text-champagne mb-2">Firm Notice</h4>
          <p className="text-xs text-white/60 leading-relaxed">
            All court dates are subject to judicial availability. Please check the portal regularly for real-time updates from your assigned counsel.
          </p>
        </div>
        <div className="prestige-card p-6 border-l-4 border-l-champagne">
          <h4 className="font-serif text-lg text-midnight mb-2">KYC Compliance</h4>
          <p className="text-xs text-midnight/60 leading-relaxed">
            Your current status is <span className="text-amber-600 font-bold uppercase">{profile?.kycStatus}</span>. 
            Ensure all identity documents are uploaded in the vault.
          </p>
        </div>
        <div className="prestige-card p-6">
          <h4 className="font-serif text-lg text-midnight mb-2">Direct Support</h4>
          <p className="text-xs text-midnight/60 leading-relaxed">
            Need immediate assistance? Use the secure chat within your specific matter dashboard to reach your legal team.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
