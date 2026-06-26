'use client';
import { useState, useEffect, use } from 'react';
import QuestionEditor from '@/components/QuestionEditor';
import { ArrowLeft, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/categories';
import { useProblem } from '@/contexts/ProblemContext';
import { getReadyQuestionGroups } from '@/lib/questionBank';

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const category = getCategoryBySlug(slug);

  const { saveQuestion } = useProblem();
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState(null);
  
  useEffect(() => {
    if (slug === 'ctf' && !mode) {
      setMode('CTF');
    }
  }, [slug, mode]);

  const [questionType, setQuestionType] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { problemData, setProblemData, sessionMeta, setSessionMeta } = useProblem();

  const readyQuestionGroups = category
    ? getReadyQuestionGroups(slug, category.name, questionType)
    : [];

  useEffect(() => {
    if (!category) return;
    const timer = window.setTimeout(() => {
      if (sessionMeta?.slug === slug) {
        setMode(sessionMeta.mode);
        setQuestionType(sessionMeta.questionType);
        if (sessionMeta.topic) setTopic(sessionMeta.topic);
      } else {
        setProblemData(null);
        setSessionMeta(null);
        setMode(null);
        setQuestionType(null);
        setTopic('');
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    slug,
    category,
    sessionMeta?.slug,
    sessionMeta?.mode,
    sessionMeta?.questionType,
    sessionMeta?.topic,
    setProblemData,
    setSessionMeta,
  ]);

  if (!category) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Category not found.</p>
        <Link href="/" style={{ color: 'var(--primary)' }}>Back to dashboard</Link>
      </div>
    );
  }

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleTypeSelect = (selectedType) => {
    setQuestionType(selectedType);
    setProblemData(null);
    setSessionMeta({ slug, category: category.name, mode, questionType: selectedType, topic: '' });
  };

  const handleGenerate = async () => {
    if (!topic || !mode || !questionType) return;
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      alert('Please enter your Gemini API Key in the sidebar first.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'statement',
          topic,
          category: category.name,
          mode,
          questionType,
          apiKey,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setProblemData(data);
      setSessionMeta({ slug, category: category.name, mode, questionType, topic });
    } catch (err) {
      console.error(err);
      alert(`Error generating problem: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProblemUpdate = (updated) => {
    setProblemData((prev) => ({ ...prev, ...updated }));
  };

  const handleReadyQuestionSelect = (question) => {
    setProblemData(question);
    setSessionMeta({
      slug,
      category: category.name,
      mode,
      questionType: question.questionType,
      topic: question.topic,
      source: 'bank',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header" style={{ justifyContent: 'flex-start', gap: '16px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>{category.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {mode && questionType ? `${mode} assessment - ${questionType}` : mode ? 'Choose question type' : 'Choose assessment type to get started'}
          </p>
        </div>
        {mode && (
          <button
            className="btn"
            style={{ marginLeft: 'auto', fontSize: '13px' }}
            onClick={() => {
              setMode(null);
              setQuestionType(null);
              setProblemData(null);
              setTopic('');
              setSessionMeta(null);
            }}
          >
            Change Type
          </button>
        )}
      </div>

      <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {!mode ? (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', textAlign: 'center' }}>
              What type of assessment?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
              Select whether you are building an Online Assessment or an Interview question.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <button
                className="glass"
                onClick={() => handleModeSelect('OA')}
                style={{
                  padding: '32px 24px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  textAlign: 'left',
                  background: 'var(--card-bg)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Briefcase size={24} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>Online Assessment (OA)</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Timed, auto-graded problems with clear input/output formats.
                </p>
              </button>
              <button
                className="glass"
                onClick={() => handleModeSelect('Interview')}
                style={{
                  padding: '32px 24px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  textAlign: 'left',
                  background: 'var(--card-bg)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <GraduationCap size={24} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>Interview</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Discussion-friendly problems suited for live technical interviews.
                </p>
              </button>
            </div>
          </div>
        ) : !questionType ? (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', textAlign: 'center' }}>
              What type of question?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
              Select the format of the question you want to generate.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {(slug === 'ctf' 
                ? [
                    { id: 'Web Exploitation', title: 'Web Exploitation', desc: 'Web vulnerabilities and exploits.', allowedModes: ['CTF'], disabledCategories: [] },
                    { id: 'Cryptography', title: 'Cryptography', desc: 'Ciphers, hashes, and crypto challenges.', allowedModes: ['CTF'], disabledCategories: [] },
                    { id: 'Reverse Engineering', title: 'Reverse Engineering', desc: 'Decompiling and analyzing binaries.', allowedModes: ['CTF'], disabledCategories: [] },
                    { id: 'Forensics', title: 'Forensics', desc: 'File analysis and data recovery.', allowedModes: ['CTF'], disabledCategories: [] },
                    { id: 'Binary Exploitation', title: 'Binary Exploitation', desc: 'Memory corruption and pwn challenges.', allowedModes: ['CTF'], disabledCategories: [] },
                  ]
                : [
                    {
                      id: 'Coding',
                      title: 'Coding Problem',
                      desc: 'Standard algorithmic or data structure problem.',
                      allowedModes: ['OA', 'Interview'],
                      disabledCategories: ['aptitude', 'cloud-computing', 'cs-fundamentals'],
                    },
                    {
                      id: 'MCQ',
                      title: 'Multiple Choice',
                      desc: 'MCQ with 4 options and 1 correct answer.',
                      allowedModes: ['OA'],
                      disabledCategories: [],
                    },
                    {
                      id: 'Predict Output',
                      title: 'Predict the Output',
                      desc: 'Provide a code snippet and ask for the output.',
                      allowedModes: ['OA'],
                      disabledCategories: ['cp', 'cloud-computing', 'system-design'],
                    },
                    {
                      id: 'Conceptual',
                      title: 'Conceptual',
                      desc: 'Theoretical or subjective explanation question.',
                      allowedModes: ['Interview', 'OA'],
                      disabledCategories: [],
                    },
                  ])
                .filter((t) => t.allowedModes.includes(mode) && !t.disabledCategories.includes(slug))
                .map((t) => (
                  <button
                    key={t.id}
                    className="glass"
                    onClick={() => handleTypeSelect(t.id)}
                    style={{
                      padding: '24px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#ffffff' }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{t.desc}</p>
                  </button>
                ))}
            </div>
          </div>
        ) : !problemData ? (
          <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', display: 'grid', gap: '24px' }}>
            {readyQuestionGroups.length > 0 && (
              <div className="glass" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Ready interview questions</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                      Pick a frequent topic and open a downloadable question immediately. No Gemini call is used here.
                    </p>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '6px 10px', whiteSpace: 'nowrap' }}>
                    {readyQuestionGroups.reduce((sum, group) => sum + group.questions.length, 0)} ready
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {readyQuestionGroups.map((subcat) => (
                    <details key={subcat.name} style={{ 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <summary style={{ 
                        padding: '16px', 
                        fontWeight: 600, 
                        cursor: 'pointer', 
                        outline: 'none',
                        listStyle: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        {subcat.name}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>{subcat.questions.length} questions</span>
                      </summary>
                      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {subcat.questions.map((question) => (
                          <button
                            key={question.id}
                            onClick={() => handleReadyQuestionSelect(question)}
                            style={{
                              padding: '12px',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'left',
                              minHeight: '68px',
                            }}
                          >
                            <span style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>{question.topic}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{question.questionType}</span>
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className="glass" style={{ padding: '32px', maxWidth: '680px', width: '100%', margin: '0 auto' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Create a custom question</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Use Gemini only when you need a fresh variation or a very specific prompt.
              </p>
              <textarea
                className="input-field"
                style={{ minHeight: '120px', resize: 'vertical', marginBottom: '24px' }}
                placeholder="Enter the core concept..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
              >
                {isGenerating ? 'Generating problem statement...' : 'Generate Problem Statement'}
              </button>
            </div>
          </div>
        ) : (
          <QuestionEditor
            data={problemData}
            onDataChange={handleProblemUpdate}
            sessionMeta={sessionMeta}
          />
        )}
      </div>
    </div>
  );
}
