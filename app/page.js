'use client';
import Link from 'next/link';
import {
  FileCode2,
  Swords,
  Flag,
  Globe,
  Smartphone,
  Cloud,
  Network,
  Cpu,
  BookOpen,
  Shield,
  Link2,
  Brain,
  Sparkles,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

const CATEGORY_ICONS = {
  aptitude: Lightbulb,
  dsa: FileCode2,
  cp: Swords,
  ctf: Flag,
  'web-dev': Globe,
  'app-dev': Smartphone,
  'cloud-computing': Cloud,
  'system-design': Network,
  'os-systems': Cpu,
  'cs-fundamentals': BookOpen,
  cybersecurity: Shield,
  'blockchain-web3': Link2,
  'ml-dl': Brain,
  'gen-ai-rag': Sparkles,
};

const CATEGORY_COLORS = {
  aptitude: '#eab308',
  dsa: 'var(--primary)',
  cp: '#f97316',
  ctf: '#ef4444',
  'web-dev': '#06b6d4',
  'app-dev': '#10b981',
  'cloud-computing': '#6366f1',
  'system-design': '#ec4899',
  'os-systems': '#8b5cf6',
  'cs-fundamentals': '#f59e0b',
  cybersecurity: '#dc2626',
  'blockchain-web3': '#14b8a6',
  'ml-dl': '#a855f7',
  'gen-ai-rag': '#3b82f6',
};

export default function Home() {
  return (
    <div>
      <div className="header" style={{ padding: '32px 48px', borderBottom: '1px solid var(--border-color)', background: 'transparent', backdropFilter: 'none', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeInDown 0.6s ease-out' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, background: 'linear-gradient(to right, var(--primary), #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.02em' }}>
            Welcome, Problem Setter
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 400, maxWidth: '500px' }}>
            What kind of technical assessment are you building today? Choose a domain to start crafting high-quality problems.
          </p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 500 }}>Select a Category</h2>
        <div className="grid" style={{ padding: 0 }}>
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug];
            const color = CATEGORY_COLORS[cat.slug] || 'var(--primary)';

            return (
              <Link
                href={`/category/${cat.slug}`}
                key={cat.slug}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="glass"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 16px ${color}20`,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-main)' }}>{cat.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
                      {cat.description}
                    </p>
                  </div>
                  <div style={{ marginTop: 'auto', alignSelf: 'flex-end', color: 'var(--primary)', background: 'var(--bg-color)', padding: '8px', borderRadius: '50%', opacity: 0.8, transition: 'all 0.3s ease' }}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
