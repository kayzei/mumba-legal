import React, { useState, useEffect } from 'react';
import { firmService } from '../services/firmService';
import { KnowledgeBaseArticle } from '../types';
import { Search, BookOpen, ChevronDown, ChevronUp, HelpCircle, Shield, Building2, Scale, Home, Lightbulb, Users, Plus, X, Terminal, Sparkles, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { geminiService } from '../services/geminiService';

const CATEGORIES = [
  { id: 'General', icon: HelpCircle },
  { id: 'Corporate Law', icon: Building2 },
  { id: 'Dispute Resolution', icon: Scale },
  { id: 'Real Estate', icon: Home },
  { id: 'Intellectual Property', icon: Lightbulb },
  { id: 'Family Law', icon: Users },
  { id: 'Portal Help', icon: Shield },
];

const DEFAULT_ARTICLES: Omit<KnowledgeBaseArticle, 'id'>[] = [
  {
    question: "How do I upload evidence to my matter?",
    answer: "Navigate to your specific matter from the dashboard, select the 'Document Vault' tab, and click the 'Upload Evidence' button. You can then select files from your device to securely transmit them to our legal team.",
    category: "Portal Help",
    tags: ["evidence", "upload", "vault"],
    createdAt: new Date().toISOString()
  },
  {
    question: "What is the typical timeline for a Corporate Law consultation?",
    answer: "Initial consultations usually take 45-60 minutes. Following the session, our team typically provides a preliminary legal opinion and proposed strategy within 3-5 business days.",
    category: "Corporate Law",
    tags: ["consultation", "timeline", "corporate"],
    createdAt: new Date().toISOString()
  },
  {
    question: "Are my messages with the firm truly secure?",
    answer: "Yes. All communications within the Mumba & Partners portal are end-to-end encrypted and stored on secure, private servers. Only authorized legal personnel assigned to your matter can access these messages.",
    category: "Portal Help",
    tags: ["security", "privacy", "encryption"],
    createdAt: new Date().toISOString()
  },
  {
    question: "What documents are required for KYC verification?",
    answer: "We typically require a valid government-issued ID (Passport or NRC), proof of residence (utility bill or bank statement not older than 3 months), and in some cases, proof of source of funds.",
    category: "General",
    tags: ["kyc", "verification", "documents"],
    createdAt: new Date().toISOString()
  },
  {
    question: "How are billable hours tracked and invoiced?",
    answer: "Our associates and partners log time spent on your matter in 6-minute increments. Fee notes are generated monthly and can be viewed in the 'Billing' section of your portal.",
    category: "General",
    tags: ["billing", "fees", "invoices"],
    createdAt: new Date().toISOString()
  }
];

const KnowledgeBase: React.FC = () => {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Admin Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    question: '',
    answer: '',
    category: 'General' as KnowledgeBaseArticle['category'],
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Command Bar State
  const [commandInput, setCommandInput] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [commandPreview, setCommandPreview] = useState<any>(null);
  const [commandError, setCommandError] = useState<string | null>(null);

  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  useEffect(() => {
    const unsub = firmService.subscribeToKnowledgeBase((data) => {
      setArticles(data as KnowledgeBaseArticle[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      for (const article of DEFAULT_ARTICLES) {
        await firmService.addKnowledgeBaseArticle(article as any);
      }
      alert('Knowledge Base populated with initial FAQs.');
    } catch (error) {
      console.error('Seeding failed:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.question || !newArticle.answer) return;

    setIsSubmitting(true);
    try {
      await firmService.addKnowledgeBaseArticle({
        question: newArticle.question,
        answer: newArticle.answer,
        category: newArticle.category,
        tags: newArticle.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewArticle({ question: '', answer: '', category: 'General', tags: '' });
    } catch (error) {
      console.error('Failed to add article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    setIsProcessingCommand(true);
    setCommandError(null);
    try {
      const parsed = await geminiService.parseFAQCommand(commandInput);
      setCommandPreview(parsed);
    } catch (error: any) {
      setCommandError(error.message || "Failed to process command");
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const confirmCommandArticle = async () => {
    if (!commandPreview) return;
    setIsSubmitting(true);
    try {
      await firmService.addKnowledgeBaseArticle({
        ...commandPreview,
        createdAt: new Date().toISOString()
      });
      setCommandPreview(null);
      setCommandInput('');
      alert('Article published successfully!');
    } catch (error) {
      console.error('Failed to save command article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayArticles = articles.length > 0 ? articles : DEFAULT_ARTICLES.map((a, i) => ({ ...a, id: `default-${i}` }) as KnowledgeBaseArticle);

  const filteredArticles = displayArticles.filter(article => {
    const matchesSearch = article.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-4xl text-midnight">Knowledge Base</h2>
            {isStaff && (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="gold-button py-2 px-4 flex items-center space-x-2 text-sm"
                >
                  <Plus size={16} />
                  <span>Add Article</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-midnight/50 font-serif italic">Legal guides, firm FAQs, and portal assistance.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight/30" size={18} />
          <input 
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-midnight/10 pl-12 pr-4 py-3 font-serif focus:outline-none focus:border-champagne"
          />
        </div>
      </header>

      {/* Staff Command Bar */}
      {isStaff && (
        <section className="prestige-card p-6 bg-midnight text-white border-l-4 border-champagne">
          <div className="flex items-center space-x-3 mb-4">
            <Terminal size={18} className="text-champagne" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">
              Staff Quick Command
            </h3>
          </div>
          
          <form onSubmit={handleCommandSubmit} className="relative">
            <input 
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. Add an FAQ about office hours being 8am to 5pm in General category with tags 'hours, office'"
              className="w-full bg-white/5 border border-white/10 p-4 pr-12 font-serif text-white focus:outline-none focus:border-champagne transition-all"
              disabled={isProcessingCommand}
            />
            <button 
              type="submit"
              disabled={isProcessingCommand || !commandInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-champagne hover:text-white disabled:opacity-30 transition-colors"
            >
              {isProcessingCommand ? (
                <div className="w-5 h-5 border-2 border-champagne border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
            </button>
          </form>

          <AnimatePresence>
            {commandError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2"
              >
                <AlertCircle size={14} />
                <span>{commandError}</span>
              </motion.div>
            )}

            {commandPreview && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-6 bg-white/5 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-champagne font-serif text-lg">Command Preview</h4>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCommandPreview(null)}
                      className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={confirmCommandArticle}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 bg-champagne text-midnight px-4 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>{isSubmitting ? 'Saving...' : 'Confirm & Publish'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Question</span>
                    <p className="font-serif text-white">{commandPreview.question}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Category</span>
                    <p className="font-serif text-white">{commandPreview.category}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Answer</span>
                    <p className="font-serif text-white/70 italic">{commandPreview.answer}</p>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    {commandPreview.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest bg-white/10 px-2 py-1 text-champagne">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-center space-x-4 text-[9px] uppercase tracking-widest text-white/30">
            <span>Try: "Add FAQ about our office location in Lusaka"</span>
            <span>•</span>
            <span>"Create an article for Real Estate about title deeds"</span>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Categories Sidebar */}
        <aside className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-midnight/40 font-bold border-b border-midnight/5 pb-2">
            Categories
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                selectedCategory === null ? 'bg-midnight text-champagne' : 'hover:bg-midnight/5 text-midnight/60'
              }`}
            >
              <BookOpen size={18} />
              <span className="font-serif tracking-wide">All Articles</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                  selectedCategory === cat.id ? 'bg-midnight text-champagne' : 'hover:bg-midnight/5 text-midnight/60'
                }`}
              >
                <cat.icon size={18} />
                <span className="font-serif tracking-wide">{cat.id}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-midnight/5 pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-midnight/40 font-bold">
              {selectedCategory || 'All Articles'} ({filteredArticles.length})
            </h3>
            {articles.length === 0 && (
              <button 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="text-[10px] uppercase tracking-widest text-champagne font-bold hover:underline disabled:opacity-50"
              >
                {isSeeding ? 'Seeding...' : 'Seed Initial FAQs'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse font-serif italic text-midnight/30">Consulting records...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="prestige-card p-20 text-center text-midnight/30 font-serif italic">
              No matching articles found. Please try a different search term or category.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="prestige-card overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                    className="w-full p-6 text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-midnight/5 text-midnight/40 group-hover:text-champagne transition-colors">
                        <HelpCircle size={18} />
                      </div>
                      <h4 className="font-serif text-xl text-midnight group-hover:text-champagne transition-colors">
                        {article.question}
                      </h4>
                    </div>
                    {expandedId === article.id ? <ChevronUp size={20} className="text-champagne" /> : <ChevronDown size={20} className="text-midnight/20" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedId === article.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-8 pt-2 ml-12">
                          <div className="p-6 bg-paper border-l-2 border-champagne">
                            <p className="text-midnight/70 leading-relaxed font-serif italic text-lg">
                              {article.answer}
                            </p>
                          </div>
                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-midnight/5 rounded-full">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-midnight/40 font-bold">Category:</span>
                              <span className="text-[10px] uppercase tracking-widest text-midnight font-bold">{article.category}</span>
                            </div>
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {article.tags.map(tag => (
                                  <span key={tag} className="px-3 py-1 bg-champagne/10 text-champagne text-[10px] uppercase tracking-widest font-bold rounded-full border border-champagne/20">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support CTA */}
      <section className="prestige-card p-10 bg-midnight text-white text-center">
        <h3 className="font-serif text-3xl text-champagne mb-4">Still have questions?</h3>
        <p className="text-white/60 max-w-2xl mx-auto mb-8 font-serif italic">
          If you cannot find the answer you are looking for, please reach out to our support team or message your assigned counsel directly through your matter dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="gold-button">Contact Firm Support</button>
          <button className="px-8 py-2 border border-white/20 hover:border-white transition-colors font-serif tracking-wide">
            View Office Locations
          </button>
        </div>
      </section>

      {/* Add Article Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-midnight/10 flex items-center justify-between bg-midnight text-white">
                <h3 className="font-serif text-2xl text-champagne">Add New FAQ Article</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddArticle} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">Question</label>
                  <input 
                    required
                    type="text"
                    value={newArticle.question}
                    onChange={(e) => setNewArticle({...newArticle, question: e.target.value})}
                    className="w-full bg-paper border border-midnight/10 p-4 font-serif focus:outline-none focus:border-champagne"
                    placeholder="e.g. How do I request a fee note?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">Answer</label>
                  <textarea 
                    required
                    rows={4}
                    value={newArticle.answer}
                    onChange={(e) => setNewArticle({...newArticle, answer: e.target.value})}
                    className="w-full bg-paper border border-midnight/10 p-4 font-serif focus:outline-none focus:border-champagne resize-none"
                    placeholder="Provide a detailed legal or procedural answer..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">Category</label>
                    <select 
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value as any})}
                      className="w-full bg-paper border border-midnight/10 p-4 font-serif focus:outline-none focus:border-champagne appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.id}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">Tags (comma separated)</label>
                    <input 
                      type="text"
                      value={newArticle.tags}
                      onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                      className="w-full bg-paper border border-midnight/10 p-4 font-serif focus:outline-none focus:border-champagne"
                      placeholder="e.g. billing, fees, invoices"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-8 py-3 font-serif text-midnight/60 hover:text-midnight transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="gold-button px-10 py-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;
