'use client';
import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useProblem } from '@/contexts/ProblemContext';

export default function Chatbot() {
  const { problemData, setProblemData } = useProblem();
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content:
        'Hi! I am your AI Problem Setter assistant. Once you generate a problem statement, ask me to refine it — change constraints, examples, difficulty, or wording.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Please enter your Gemini API Key in the sidebar first.' },
      ]);
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, problemData: problemData || {}, apiKey }),
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to get response');
      }

      setMessages((prev) => [...prev, { role: 'system', content: '' }]);
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fullText += decoder.decode(value, { stream: true });
        
        const separatorIdx = fullText.indexOf('---UPDATE---');
        const displayText = separatorIdx !== -1 ? fullText.substring(0, separatorIdx).trim() : fullText;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = displayText;
          return newMessages;
        });
      }
      
      const separatorIdx = fullText.indexOf('---UPDATE---');
      if (separatorIdx !== -1) {
        const rawJsonStr = fullText.substring(separatorIdx + 12).trim();
        const jsonStr = rawJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.title || parsed.markdown) {
            setProblemData((prev) => ({
              ...prev,
              title: parsed.title ?? prev?.title,
              markdown: parsed.markdown ?? prev?.markdown,
              solutionsReady: false,
            }));
          }
        } catch(e) {
          console.warn("Failed to parse updated problem data (could be partial or malformed)", e);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="chat-panel">
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '6px',
            borderRadius: '50%',
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>AI Assistant</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {problemData?.markdown ? 'Ready to refine your question' : 'Powered by Gemini'}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--card-bg)',
              color: msg.role === 'user' ? 'white' : 'var(--text-main)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: msg.role === 'system' ? '1px solid var(--border-color)' : 'none',
              maxWidth: '85%',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {msg.content}
          </div>
        ))}
        {isSending && (
          <div
            style={{
              alignSelf: 'flex-start',
              color: 'var(--text-muted)',
              fontSize: '13px',
              padding: '8px 0',
            }}
          >
            Thinking...
          </div>
        )}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            padding: '4px',
            borderRadius: '24px',
          }}
        >
          <input
            type="text"
            placeholder="Ask a question or modify the problem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 16px',
              color: 'var(--text-main)',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.6 : 1,
            }}
          >
            <Send size={16} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
