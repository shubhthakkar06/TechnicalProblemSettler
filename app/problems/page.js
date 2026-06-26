'use client';
import { useProblem } from '@/contexts/ProblemContext';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { exportZip } from '@/lib/export';
import { useState } from 'react';

const md = new MarkdownIt();

export default function MyProblemsPage() {
  const { myProblems } = useProblem();
  const [expandedId, setExpandedId] = useState(null);

  const handleDownloadMD = (q) => {
    const content = `${q.markdown}\n\n## Correct Answer\n${q.correctAnswer}\n\n## Explanation\n${q.explanation}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${q.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>My Problems</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {myProblems.length} exported questions in your library.
          </p>
        </div>
      </div>

      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        {myProblems.length === 0 ? (
          <div className="glass" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Your library is empty</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              When you export questions from your Saved cart, they will appear here permanently.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {myProblems.map((q, index) => {
              const isExpanded = expandedId === q.id;
              
              return (
                <div key={q.id} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          {q.questionType || 'Coding'}
                        </span>
                        <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          {q.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{index + 1}. {q.title}</h3>
                      {!isExpanded && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {q.markdown.replace(/#/g, '').substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(q.questionType === 'Coding' || !q.questionType) ? (
                        <button className="btn btn-primary" onClick={() => exportZip(q)}>
                          <Download size={16} /> ZIP
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => handleDownloadMD(q)}>
                          <Download size={16} /> MD
                        </button>
                      )}
                      <button 
                        className="btn" 
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div className="prose" style={{ fontSize: '14px', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: md.render(q.markdown) }} />
                      
                      {q.correctAnswer && (
                        <div style={{ marginTop: '24px' }}>
                          <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>Answer / Optimal Solution</h4>
                          <div className="glass" style={{ padding: '16px', background: 'rgba(0,0,0,0.1)' }}>
                             {q.questionType === 'Coding' || !q.questionType ? (
                               <pre style={{ fontSize: '12px', overflowX: 'auto' }}><code>{q.optimalCode}</code></pre>
                             ) : (
                               <div dangerouslySetInnerHTML={{ __html: md.render(q.correctAnswer) }} />
                             )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
