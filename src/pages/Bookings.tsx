import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { firmService } from '../services/firmService';
import { Booking } from '../types';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  "Corporate Law",
  "Dispute Resolution",
  "Real Estate",
  "Intellectual Property",
  "Family Law"
];

const Bookings: React.FC = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    department: DEPARTMENTS[0],
    date: '',
    notes: ''
  });

  useEffect(() => {
    if (profile) {
      const unsub = firmService.subscribeToBookings(profile.uid, setBookings);
      return () => unsub();
    }
  }, [profile]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newBooking.date) return;

    await firmService.createBooking({
      clientId: profile.uid,
      department: newBooking.department,
      date: new Date(newBooking.date).toISOString(),
      status: 'pending',
      notes: newBooking.notes
    });

    setIsBooking(false);
    setNewBooking({ department: DEPARTMENTS[0], date: '', notes: '' });
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl text-midnight mb-2">Consultations</h2>
          <p className="text-midnight/50 font-serif italic">Schedule a private session with our specialized departments.</p>
        </div>
        <button 
          onClick={() => setIsBooking(true)}
          className="gold-button"
        >
          Request Consultation
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-midnight/40 font-bold border-b border-midnight/5 pb-2">
            Upcoming & Past Sessions
          </h3>
          
          {bookings.length === 0 ? (
            <div className="prestige-card p-12 text-center text-midnight/30 font-serif italic">
              No consultation history found.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="prestige-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 flex items-center justify-center ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      <CalendarIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-midnight">{booking.department}</h4>
                      <div className="flex items-center space-x-3 text-xs text-midnight/40">
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{new Date(booking.date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 text-[10px] uppercase tracking-widest border ${
                      booking.status === 'confirmed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                      booking.status === 'cancelled' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                      'border-amber-200 text-amber-600 bg-amber-50'
                    }`}>
                      {booking.status === 'confirmed' && <CheckCircle size={10} />}
                      {booking.status === 'cancelled' && <XCircle size={10} />}
                      {booking.status === 'pending' && <AlertCircle size={10} />}
                      <span>{booking.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="prestige-card p-8 bg-midnight text-white">
            <h3 className="font-serif text-2xl text-champagne mb-6">Our Departments</h3>
            <div className="space-y-6">
              {DEPARTMENTS.map((dept) => (
                <div key={dept} className="border-b border-white/5 pb-4 last:border-0">
                  <h4 className="font-serif text-lg mb-1">{dept}</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                    Specialized counsel for complex {dept.toLowerCase()} matters.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBooking && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="prestige-card max-w-lg w-full p-10 relative"
          >
            <button 
              onClick={() => setIsBooking(false)}
              className="absolute top-6 right-6 text-midnight/20 hover:text-midnight transition-colors"
            >
              <XCircle size={24} />
            </button>
            
            <h3 className="font-serif text-3xl text-midnight mb-2">Request Consultation</h3>
            <p className="text-midnight/50 text-sm font-serif italic mb-8">Select your preferred department and schedule.</p>
            
            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-midnight/50 mb-1">Department</label>
                <select 
                  value={newBooking.department}
                  onChange={(e) => setNewBooking({...newBooking, department: e.target.value})}
                  className="w-full bg-paper border border-midnight/10 p-3 font-serif focus:outline-none focus:border-champagne"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-midnight/50 mb-1">Preferred Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                  className="w-full bg-paper border border-midnight/10 p-3 font-serif focus:outline-none focus:border-champagne"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-midnight/50 mb-1">Brief Notes (Optional)</label>
                <textarea 
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                  className="w-full bg-paper border border-midnight/10 p-3 font-serif focus:outline-none focus:border-champagne h-24 resize-none"
                  placeholder="Summarize your legal inquiry..."
                />
              </div>

              <button type="submit" className="gold-button w-full py-4 text-lg">
                Submit Request
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
