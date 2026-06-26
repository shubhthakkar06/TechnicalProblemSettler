'use client';
import { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { Download, Save } from 'lucide-react';
import { useProblem } from '@/contexts/ProblemContext';
import { useRouter } from 'next/navigation';
import { exportZip } from '@/lib/export';

const md = new MarkdownIt();

export default function QuestionEditor({ data, onDataChange, sessionMeta }) {
  const [activeTab, setActiveTab] = useState('markdown');
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
  const { saveQuestion } = useProblem();
  const router = useRouter();

  const isCoding = data.questionType === 'Coding' || !data.questionType;
  const hasSolutions = data.solutionsReady && (isCoding ? data.optimalCode : data.correctAnswer);

  let tabs = [{ id: 'markdown', label: 'Problem Statement' }];
  
  if (hasSolutions) {
    if (isCoding) {
      tabs = [
        { id: 'markdown', label: 'Problem Statement' },
        { id: 'optimalCode', label: 'Optimal Solution' },
        { id: 'betterCode', label: 'Better Solution' },
        { id: 'bruteCode', label: 'Brute Force' },
        { id: 'testGenCode', label: 'Test Generator' },
      ];
    } else {
      tabs = [
        { id: 'markdown', label: 'Problem Statement' },
        { id: 'correctAnswer', label: 'Correct Answer' },
        { id: 'explanation', label: 'Explanation' },
      ];
      if (data.hintFileGeneratorCode) {
        tabs.push({ id: 'hintFileGeneratorCode', label: 'Hint Generator' });
      }
    }
  }



  const generateSolutions = async () => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      alert('Please enter your Gemini API Key in the sidebar first.');
      return null;
    }

    setIsGeneratingSolutions(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'solutions',
          title: data.title,
          markdown: data.markdown,
          category: sessionMeta?.category,
          mode: sessionMeta?.mode,
          questionType: sessionMeta?.questionType || data.questionType || 'Coding',
          apiKey,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to generate solutions');
      onDataChange(result);
      return result;
    } finally {
      setIsGeneratingSolutions(false);
    }
  };



  const handleDownload = async () => {
    try {
      let exportData = data;
      if (!hasSolutions) {
        exportData = await generateSolutions();
        if (!exportData) return;
      }
      const isCTF = data.mode === 'CTF' || sessionMeta?.mode === 'CTF';
      const shouldZip = isCoding || isCTF;
      if (shouldZip) {
        await exportZip(exportData);
      } else {
        const content = `${exportData.markdown}\n\n## Correct Answer\n${exportData.correctAnswer}\n\n## Explanation\n${exportData.explanation}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      alert(`Error preparing download: ${err.message}`);
    }
  };

  const handleSave = () => {
    saveQuestion({ 
      ...data, 
      category: sessionMeta?.category, 
      questionType: sessionMeta?.questionType || 'Coding',
      mode: sessionMeta?.mode
    });
    router.push('/saved');
  };

  const renderContent = () => {
    if (activeTab === 'markdown') {
      return (
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: md.render(data.markdown) }}
          style={{ padding: '20px', lineHeight: '1.6', fontSize: '15px' }}
        />
      );
    }
    return (
      <textarea
        className="input-field"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '300px',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: 'none',
          background: 'transparent',
          resize: 'none',
        }}
        value={data[activeTab]}
        readOnly
      />
    );
  };

  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{data.title}</h2>
          {!hasSolutions && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {data.readyToDownload
                ? 'Ready to download now. Use the AI assistant only if you want a custom modification.'
                : 'Review the statement and use the AI assistant to make changes. Download when ready to generate solutions.'}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 16px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>

          {hasSolutions && (
            <button
              className="btn"
              onClick={handleSave}
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Save size={16} /> Finalize & Save
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={isGeneratingSolutions}
          >
            <Download size={16} />
            {isGeneratingSolutions ? 'Generating solutions...' : hasSolutions || data.readyToDownload ? (isCoding || sessionMeta?.mode === 'CTF' ? 'Download ZIP' : 'Download Markdown') : 'Confirm & Download'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>{renderContent()}</div>


    </div>
  );
}
