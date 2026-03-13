import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { firmService } from '../services/firmService';
import { Matter, LegalDocument, Message } from '../types';
import { 
  FileText, 
  MessageSquare, 
  Info, 
  Download, 
  Upload, 
  Send,
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MatterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      firmService.getMatter(id).then(data => {
        setMatter(data);
        setLoading(false);
      });

      const unsubDocs = firmService.subscribeToDocuments(id, setDocuments);
      const unsubMsgs = firmService.subscribeToMessages(id, (msgs) => {
        setMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

      return () => {
        unsubDocs();
        unsubMsgs();
      };
    }
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !profile) return;

    await firmService.sendMessage(id, {
      text: newMessage,
      senderId: profile.uid,
      senderName: profile.displayName,
      matterId: id,
      createdAt: new Date().toISOString()
    });
    setNewMessage('');
  };

  if (loading) return <div className="font-serif animate-pulse">Loading matter details...</div>;
  if (!matter) return <div>Matter not found.</div>;

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center space-x-2 text-midnight/40 hover:text-champagne transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs uppercase tracking-widest">Back to Portfolio</span>
      </Link>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-champagne font-bold">
              {matter.department}
            </span>
            <span className="w-1 h-1 bg-midnight/20 rounded-full" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/40">
              Ref: {matter.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h2 className="font-serif text-4xl text-midnight">{matter.title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-midnight/40">Current Stage</p>
            <p className="font-serif text-xl text-midnight">{matter.status}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            matter.status === 'Open' ? 'bg-emerald-500' :
            matter.status === 'In Progress' ? 'bg-blue-500' :
            'bg-amber-500'
          } animate-pulse`} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-midnight/10">
        {[
          { id: 'overview', name: 'Matter Overview', icon: Info },
          { id: 'documents', name: 'Document Vault', icon: FileText },
          { id: 'messages', name: 'Secure Chat', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-8 py-4 font-serif tracking-wide transition-all relative ${
              activeTab === tab.id ? 'text-midnight' : 'text-midnight/40 hover:text-midnight/60'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.name}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-champagne"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="prestige-card p-8">
                  <h3 className="font-serif text-xl mb-4 border-b border-midnight/5 pb-2">Case Summary</h3>
                  <p className="text-midnight/70 leading-relaxed font-serif italic text-lg">
                    {matter.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="prestige-card p-6 border-l-4 border-l-midnight">
                    <div className="flex items-center space-x-3 mb-4 text-midnight/40">
                      <CalendarIcon size={18} />
                      <h4 className="text-[10px] uppercase tracking-widest">Next Court Date</h4>
                    </div>
                    <p className="font-serif text-2xl text-midnight">
                      {matter.nextCourtDate ? new Date(matter.nextCourtDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'To Be Scheduled'}
                    </p>
                  </div>
                  <div className="prestige-card p-6 border-l-4 border-l-champagne">
                    <div className="flex items-center space-x-3 mb-4 text-midnight/40">
                      <Clock size={18} />
                      <h4 className="text-[10px] uppercase tracking-widest">Last Activity</h4>
                    </div>
                    <p className="font-serif text-2xl text-midnight">
                      {matter.lastUpdate || 'Initial Filing'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="prestige-card p-6 bg-midnight text-white">
                  <h3 className="font-serif text-lg text-champagne mb-4">Assigned Counsel</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-serif">M</div>
                      <div>
                        <p className="text-sm font-serif">Mumba & Partners Team</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/40">{matter.department}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Your matter is being handled by our {matter.department} specialists. Use the secure chat for direct communication.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div 
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl text-midnight">Central Document Repository</h3>
                <button className="gold-button flex items-center space-x-2">
                  <Upload size={18} />
                  <span>Upload Evidence</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-midnight/30 font-serif italic">
                    No documents have been uploaded to this matter yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="prestige-card p-4 flex items-center justify-between group hover:border-champagne transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-midnight/5 text-midnight">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-serif truncate max-w-[150px]">{doc.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-midnight/40">{doc.type}</p>
                        </div>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-midnight/20 hover:text-champagne transition-colors"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="prestige-card h-[600px] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-midnight/5 bg-midnight/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] uppercase tracking-widest text-midnight/60 font-bold">Counsel Online</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-midnight/40 italic font-serif">End-to-End Encrypted</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-midnight/20">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="font-serif italic">Initiate a secure conversation with your legal team.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === profile?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'text-right' : 'text-left'}`}>
                          <p className="text-[10px] uppercase tracking-widest text-midnight/40 mb-1">
                            {isMe ? 'You' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className={`p-4 font-serif ${
                            isMe ? 'bg-midnight text-white' : 'bg-paper border border-midnight/10 text-midnight'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-midnight/5 bg-paper flex space-x-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Compose secure message..."
                  className="flex-1 bg-white border border-midnight/10 px-4 py-3 font-serif focus:outline-none focus:border-champagne"
                />
                <button type="submit" className="gold-button px-4 flex items-center justify-center">
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MatterDetail;
