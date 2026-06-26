export const exportZip = async (exportData) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  zip.file('problem_statement.md', exportData.markdown || '');
  if (exportData.optimalCode) zip.file('optimal_solution.cpp', exportData.optimalCode);
  if (exportData.betterCode) zip.file('better_solution.cpp', exportData.betterCode);
  if (exportData.bruteCode) zip.file('brute_force_solution.cpp', exportData.bruteCode);
  if (exportData.testGenCode) zip.file('test_case_generator.py', exportData.testGenCode);
  if (exportData.correctAnswer) zip.file('correct_answer.md', exportData.correctAnswer);
  if (exportData.explanation) zip.file('explanation.md', exportData.explanation);
  
  // For CTF Hint Packaging
  if (exportData.hintFileGeneratorCode) zip.file('hint_generator.py', exportData.hintFileGeneratorCode);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
