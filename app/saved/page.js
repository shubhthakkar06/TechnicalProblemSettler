'use client';
import { useProblem } from '@/contexts/ProblemContext';
import { FileDown, Trash2, Download } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { exportZip } from '@/lib/export';

const md = new MarkdownIt();

export default function SavedPage() {
  const { savedQuestions, removeQuestion, moveToMyProblems, moveMultipleToMyProblems } = useProblem();

  const handleDownloadPDF = async () => {
    const nonCodingQuestions = savedQuestions.filter(q => q.questionType !== 'Coding' && q.questionType);
    if (nonCodingQuestions.length === 0) {
      alert("No non-coding questions to export to PDF.");
      return;
    }
    
    // Dynamically import html2pdf
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    element.style.color = '#000'; // Force black text for PDF
    element.style.background = '#fff';

    let htmlContent = `<h1 style="text-align:center; font-size: 28px; margin-bottom: 40px; color:#000;">Technical Assessment</h1>`;
    
    // Part 1: Questions
    nonCodingQuestions.forEach((q, index) => {
      htmlContent += `<div style="margin-bottom: 40px; page-break-inside: avoid;">`;
      htmlContent += `<h2 style="font-size: 20px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 16px; color:#000;">${index + 1}. ${q.title} <span style="font-size:12px; font-weight:normal; color:#666;">(${q.questionType || 'Coding'} - ${q.category})</span></h2>`;
      const cleanMarkdown = q.markdown.replace(/^#\s+[^\n]+\n*/, '');
      htmlContent += `<div style="font-size: 14px; line-height: 1.6; color:#000;">${md.render(cleanMarkdown)}</div>`;
      htmlContent += `</div>`;
    });

    // Part 2: Answer Key (Page Break)
    htmlContent += `<div style="page-break-before: always;"></div>`;
    htmlContent += `<h1 style="text-align:center; font-size: 28px; margin-bottom: 40px; color:#000;">Answer Key & Solutions</h1>`;

    nonCodingQuestions.forEach((q, index) => {
      htmlContent += `<div style="margin-bottom: 40px; page-break-inside: avoid;">`;
      htmlContent += `<h3 style="font-size: 18px; color:#000;">${index + 1}. ${q.title}</h3>`;
      
      htmlContent += `<p style="font-weight: bold; margin-bottom: 8px; color:#000;">Correct Answer:</p>`;
      htmlContent += `<div style="margin-bottom: 12px; color:#000;">${md.render(q.correctAnswer || '')}</div>`;
      htmlContent += `<p style="font-weight: bold; margin-bottom: 8px; color:#000;">Explanation:</p>`;
      htmlContent += `<div style="color:#000;">${md.render(q.explanation || '')}</div>`;
      
      htmlContent += `</div>`;
    });

    element.innerHTML = htmlContent;

    const opt = {
      margin:       0.5,
      filename:     'assessment.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      moveMultipleToMyProblems(nonCodingQuestions.map(q => q.id));
    });
  };

  const handleDownloadMD = (q) => {
    const content = `${q.markdown}\n\n## Correct Answer\n${q.correctAnswer}\n\n## Explanation\n${q.explanation}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${q.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    moveToMyProblems(q.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Saved Questions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {savedQuestions.length} questions ready to export.
          </p>
        </div>
        {savedQuestions.some(q => q.questionType !== 'Coding' && q.questionType) && (
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <FileDown size={16} /> Download Assessment PDF
          </button>
        )}
      </div>

      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        {savedQuestions.length === 0 ? (
          <div className="glass" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Generate some questions and click &quot;Finalize &amp; Save&quot; to add them to your assessment export.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {savedQuestions.map((q, index) => (
              <div key={q.id} className="glass" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {q.markdown.replace(/#/g, '').substring(0, 150)}...
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(q.questionType === 'Coding' || !q.questionType) ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={async () => {
                        await exportZip(q);
                        moveToMyProblems(q.id);
                      }}
                    >
                      <Download size={16} /> Download ZIP
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleDownloadMD(q)}
                    >
                      <Download size={16} /> Download MD
                    </button>
                  )}
                  <button 
                    className="btn" 
                    onClick={() => removeQuestion(q.id)}
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
