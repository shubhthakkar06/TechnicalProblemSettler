'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit2, History, Settings, LogOut, Code2, Sun, Moon, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState('dark');
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('GEMINI_API_KEY') || '';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('GEMINI_API_KEY', val);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FolderGit2 size={20} /> },
    { name: 'Saved Questions', path: '/saved', icon: <Save size={20} /> },
    { name: 'My Problems', path: '/problems', icon: <Code2 size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Code2 size={22} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>ProblemSettler</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {item.icon}
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Gemini API Key</p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={handleApiKeyChange}
            placeholder="AIzaSy..." 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontSize: '12px', outline: 'none' }}
          />
        </div>
        <button 
          className="btn" 
          style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          Toggle Theme
        </button>
      </div>
    </aside>
  );
}
