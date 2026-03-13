import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { firmService } from '../services/firmService';
import { Invoice } from '../types';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Billing: React.FC = () => {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      const unsub = firmService.subscribeToInvoices(profile.uid, (data) => {
        setInvoices(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [profile]);

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) return <div className="font-serif animate-pulse">Loading financial records...</div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl text-midnight mb-2">Billing & Invoices</h2>
          <p className="text-midnight/50 font-serif italic">Manage your fee notes and track billable hours.</p>
        </div>
        <div className="prestige-card bg-midnight text-white px-8 py-4 flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-champagne">Total Outstanding</p>
            <p className="font-serif text-2xl">ZMW {totalOutstanding.toLocaleString()}</p>
          </div>
          <CreditCard className="text-champagne" size={32} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-midnight/40 font-bold border-b border-midnight/5 pb-2">
          Financial Statements
        </h3>

        {invoices.length === 0 ? (
          <div className="prestige-card p-20 text-center text-midnight/30 font-serif italic">
            No billing records found for your account.
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="prestige-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-champagne transition-all">
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 flex items-center justify-center ${
                    invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                    invoice.status === 'overdue' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <CreditCard size={28} />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-midnight">{invoice.description}</h4>
                    <div className="flex items-center space-x-4 text-xs text-midnight/40">
                      <span>Ref: {invoice.id.slice(0, 8).toUpperCase()}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-10">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-midnight/40">Amount</p>
                    <p className="font-serif text-xl text-midnight font-bold">ZMW {invoice.amount.toLocaleString()}</p>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-3 py-1 text-[10px] uppercase tracking-widest border ${
                    invoice.status === 'paid' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                    invoice.status === 'overdue' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                    'border-amber-200 text-amber-600 bg-amber-50'
                  }`}>
                    {invoice.status === 'paid' && <CheckCircle size={10} />}
                    {invoice.status === 'overdue' && <AlertCircle size={10} />}
                    <span>{invoice.status}</span>
                  </div>

                  <button className="p-2 text-midnight/20 hover:text-champagne transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="prestige-card p-8 border-t-4 border-t-midnight">
          <h4 className="font-serif text-xl text-midnight mb-4">Payment Methods</h4>
          <p className="text-sm text-midnight/60 mb-6 leading-relaxed">
            We accept bank transfers, credit cards, and mobile money payments. 
            Please include your invoice reference number in all transactions.
          </p>
          <div className="flex space-x-4">
            <div className="h-8 w-12 bg-midnight/5 rounded border border-midnight/10 flex items-center justify-center text-[8px] font-bold">VISA</div>
            <div className="h-8 w-12 bg-midnight/5 rounded border border-midnight/10 flex items-center justify-center text-[8px] font-bold">MC</div>
            <div className="h-8 w-12 bg-midnight/5 rounded border border-midnight/10 flex items-center justify-center text-[8px] font-bold">AIRTEL</div>
          </div>
        </div>
        <div className="prestige-card p-8 border-t-4 border-t-champagne">
          <h4 className="font-serif text-xl text-midnight mb-4">Financial Assistance</h4>
          <p className="text-sm text-midnight/60 mb-6 leading-relaxed">
            Questions regarding your fee note or billable hours? 
            Contact our accounts department directly through the secure messaging system.
          </p>
          <button className="text-champagne font-serif italic hover:underline">Contact Accounts →</button>
        </div>
      </section>
    </div>
  );
};

export default Billing;
