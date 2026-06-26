'use client';
import { ProblemProvider } from '@/contexts/ProblemContext';

export default function AppProviders({ children }) {
  return <ProblemProvider>{children}</ProblemProvider>;
}
