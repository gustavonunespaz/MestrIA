import React, { useState, useEffect, useRef } from 'react';
import { testConnection, apiClient } from './infrastructure/apiClient';
import { socketClient } from './infrastructure/socketClient';
import { 
  Shield, 
  Zap, 
  PlusCircle, 
  Sparkles, 
  Send, 
  RefreshCw, 
  LogOut,
  Map,
  Users,
  Terminal,
  ChevronRight
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function App() {
  // --- States ---
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // Auth
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authEmail, setAuthEmail] = useState(`hero_${Math.floor(Math.random() * 1000)}@mestria.com`);
  
  // Campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  
  // Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: '1', text: 'Saudações, Mestre. Selecione uma campanha e comece a narrar para que o Oráculo possa auxiliá-lo.', sender: 'ai', timestamp: new Date() }
  ]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  // UI Helpers
  const [loading, setLoading] = useState({ auth: false, campaign: false, chat: false });
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    socketClient.on('connect', () => {
      setSocketStatus('connected');
      addLog('Socket connected.');
    });
    socketClient.on('disconnect', () => setSocketStatus('disconnected'));
    
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCampaigns();
    }

    return () => {
      socketClient.off('connect');
      socketClient.off('disconnect');
    };
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // --- Actions ---
  const handlePing = async () => {
    addLog('Pinging /api/health...');
    const res = await testConnection();
    setApiStatus(res);
    addLog(res.success ? 'Health: OK' : `Health: FAILED (${res.error})`);
  };

  const handleRegisterAndLogin = async () => {
    setLoading(prev => ({ ...prev, auth: true }));
    setError(null);
    addLog('Trying to Auth...');
    try {
      await apiClient.post('/users', { name: 'Player One', email: authEmail, password: 'Password123!' });
      const res = await apiClient.post('/users/auth/login', { email: authEmail, password: 'Password123!' });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      addLog('Auth SUCCESS.');
      fetchCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Auth failed');
      addLog('Auth FAILED.');
    } finally {
      setLoading(prev => ({ ...prev, auth: false }));
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCampaigns([]);
    setActiveCampaign(null);
    addLog('Logged out.');
  };

  const fetchCampaigns = async () => {
    addLog('Fetching campaigns...');
    try {
      const res = await apiClient.get('/campaigns/list');
      setCampaigns(res.data);
      if (res.data.length > 0 && !activeCampaign) {
        setActiveCampaign(res.data[0]);
      }
    } catch (err) {
      addLog('Fetch campaigns FAILED.');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;
    setLoading(prev => ({ ...prev, campaign: true }));
    addLog('Creating campaign...');
    try {
      const res = await apiClient.post('/campaigns', {
        title: newCampaignName,
        description: 'Uma nova jornada épica se inicia nas terras de MestrIA.',
        systemBase: 'D&D 5e',
        dmType: 'AI'
      });
      setNewCampaignName('');
      addLog('Campaign CREATED.');
      fetchCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar campanha');
      addLog('Campaign creation FAILED.');
    } finally {
      setLoading(prev => ({ ...prev, campaign: false }));
    }
  };

  const handleSendPrompt = async () => {
    if (!currentPrompt || loading.chat || !activeCampaign) {
      if (!activeCampaign) setError('Selecione uma campanha primeiro!');
      return;
    }
    
    setError(null);
    const userMsg: Message = { id: Date.now().toString(), text: currentPrompt, sender: 'user', timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentPrompt('');
    setLoading(prev => ({ ...prev, chat: true }));
    addLog('Sending prompt to AI...');

    try {
      const res = await apiClient.post('/ai/generate', { 
        campaignId: activeCampaign.id,
        message: userMsg.text,
        type: 'narrative'
      });
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: res.data.content || 'O Oráculo permanece em silêncio...', 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, aiMsg]);
      addLog('AI response RECEIVED.');
    } catch (err: any) {
      addLog('AI request FAILED.');
      setChatMessages(prev => [...prev, { 
        id: 'err', 
        text: `Erro: ${err.response?.data?.error || 'O Oracle está indisponível.'}`, 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  // --- Render ---
  return (
    <div className="app-wrapper animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>MestrIA</h1>
          <p style={{ color: 'var(--text-muted)' }}>Console do Mestre • MVP Alpha</p>
        </div>
        <div className="flex-column items-end gap-2">
          <div className="flex items-center gap-2">
            <span className={`status-pill ${socketStatus === 'connected' ? 'online' : 'offline'}`}>
              Socket: {socketStatus.toUpperCase()}
            </span>
            <button onClick={handlePing} className="btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem' }}>
              PING {apiStatus?.success && '✅'}
            </button>
          </div>
          {token && (
            <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={14} /> Sair
            </button>
          )}
        </div>
      </header>

      {!token ? (
        <div className="glass-card text-center flex-column items-center gap-6" style={{ maxWidth: '500px', margin: '4rem auto' }}>
          <Shield size={48} color="var(--primary)" />
          <h2 className="justify-center">Autenticação</h2>
          <div style={{ width: '100%' }}>
            <label className="label-sm">E-mail de Teste</label>
            <input className="input-field" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleRegisterAndLogin} disabled={loading.auth}>
            {loading.auth ? <RefreshCw className="animate-spin" /> : 'Entrar no MestrIA'}
          </button>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{error}</p>}
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Left: Sidebar */}
          <div className="flex-column gap-6">
            <div className="glass-card">
              <h2><Map size={20} color="var(--primary)" /> Campanhas</h2>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <form onSubmit={handleCreateCampaign} className="flex-column gap-2">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input placeholder="Nova Campanha..." className="input-field" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} />
                    <button className="btn btn-primary" type="submit" disabled={loading.campaign}><PlusCircle size={20} /></button>
                  </div>
                </form>

                <div className="flex-column" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {campaigns.map((c: any) => (
                    <div 
                      key={c.id} 
                      className={`campaign-item animate-fade-in ${activeCampaign?.id === c.id ? 'active' : ''}`}
                      onClick={() => setActiveCampaign(c)}
                      style={{ cursor: 'pointer', borderColor: activeCampaign?.id === c.id ? 'var(--primary)' : '' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</div>
                      {activeCampaign?.id === c.id && <ChevronRight size={14} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card flex-column gap-3" style={{ padding: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '0.8rem' }}><Terminal size={14} color="var(--accent)" /> Logs do Sistema</h2>
              </div>
              <div className="flex-column" style={{ height: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </div>

          {/* Right: AI Oracle Chat */}
          <div className="glass-card chat-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h2><Sparkles size={20} color="var(--accent)" /> O Oráculo (Ollama)</h2>
              <span className="status-pill online" style={{ fontSize: '0.6rem' }}>
                {activeCampaign ? `Contexto: ${activeCampaign.title}` : 'Sem Campanha'}
              </span>
            </div>

            <div className="messages-list" ref={scrollRef}>
              {chatMessages.map((m) => (
                <div key={m.id} className={`message-bubble ${m.sender === 'ai' ? 'message-ai' : 'message-user'} animate-fade-in`}>
                  {m.text}
                </div>
              ))}
              {loading.chat && <div className="message-ai message-bubble" style={{ opacity: 0.6 }}>Conjurando resposta...</div>}
            </div>

            <div className="flex-column gap-2" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              {error && <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  className="input-field" 
                  placeholder={activeCampaign ? "Descreva uma ação ou peça uma narração..." : "Selecione uma campanha à esquerda."}
                  value={currentPrompt}
                  disabled={!activeCampaign}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                />
                <button className="btn btn-primary" onClick={handleSendPrompt} disabled={loading.chat || !currentPrompt || !activeCampaign}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
