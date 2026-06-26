export const CATEGORIES = [
  { slug: 'aptitude', name: 'Aptitude', description: 'Quantitative, logical reasoning, and verbal aptitude.' },
  { slug: 'dsa', name: 'DSA', description: 'Data structures, algorithms, and coding problems.' },
  { slug: 'cp', name: 'CP', description: 'Competitive programming challenges and contest-style tasks.' },
  { slug: 'ctf', name: 'CTF', description: 'Capture-the-flag puzzles, exploits, and security challenges.' },
  { slug: 'web-dev', name: 'Web Dev', description: 'Frontend, backend, and full-stack web assessments.' },
  { slug: 'app-dev', name: 'App Dev', description: 'Mobile and desktop application development tasks.' },
  { slug: 'cloud-computing', name: 'Cloud Computing', description: 'AWS, GCP, Azure, and cloud architecture scenarios.' },
  { slug: 'system-design', name: 'System Design', description: 'Scalable system design and architecture interviews.' },
  { slug: 'os-systems', name: 'OS & Systems', description: 'Operating systems, concurrency, and low-level systems.' },
  { slug: 'cs-fundamentals', name: 'CS Fundamentals', description: 'Core computer science theory and fundamentals.' },
  { slug: 'cybersecurity', name: 'Cybersecurity', description: 'Security concepts, hardening, and defensive assessments.' },
  { slug: 'blockchain-web3', name: 'Blockchain & Web3', description: 'Smart contracts, DeFi, and decentralized systems.' },
  { slug: 'ml-dl', name: 'ML / DL', description: 'Machine learning and deep learning problems.' },
  { slug: 'gen-ai-rag', name: 'Gen AI & RAG', description: 'LLMs, retrieval-augmented generation, and AI pipelines.' },
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((cat) => cat.slug === slug);
}
