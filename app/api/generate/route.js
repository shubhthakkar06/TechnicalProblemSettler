import { NextResponse } from 'next/server';
import { createAI, generateJsonWithRetry, parseGeminiError } from '@/lib/gemini';

const statementSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    markdown: { type: 'string' },
  },
  required: ['title', 'markdown'],
};

const codingSolutionsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    optimalCode: { type: 'string' },
    betterCode: { type: 'string' },
    bruteCode: { type: 'string' },
    testGenCode: { type: 'string' },
  },
  required: ['optimalCode', 'betterCode', 'bruteCode', 'testGenCode'],
};

const answerSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    correctAnswer: { type: 'string' },
    explanation: { type: 'string' },
  },
  required: ['correctAnswer', 'explanation'],
};

const ctfSolutionsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    correctAnswer: { type: 'string' },
    explanation: { type: 'string' },
    hintFileGeneratorCode: { type: 'string' },
  },
  required: ['correctAnswer', 'explanation', 'hintFileGeneratorCode'],
};

function buildStatementPrompt({ category, mode, topic, questionType }) {
  const isCoding = questionType === 'Coding';
  return `You are an expert technical problem setter creating a ${mode} assessment for the category: ${category}.
The core concept is: "${topic}".

Generate ONLY the problem statement — do not include any solution code or test generators.

Output a strictly valid JSON object with these keys:
- "title": A catchy, professional title for the problem.
- "markdown": The full problem statement in Markdown. ${isCoding ? 'Include: Problem description, Input format, Output format, Constraints, and 2 Examples with explanations.' : 'Include the detailed question description and, if it is an MCQ, the multiple choice options (A, B, C, D).'}

Tailor difficulty and format for a ${mode === 'OA' ? 'Online Assessment (timed, auto-graded)' : 'Technical Interview (discussion-friendly, may include follow-ups)'} setting.

Output only the JSON. Do not include markdown code block wrappers like \`\`\`json.`;
}

function buildSolutionsPrompt({ category, mode, title, markdown, questionType }) {
  const isCoding = questionType === 'Coding';
  
  if (mode === 'CTF') {
    return `You are an expert technical problem setter. Given this CTF problem for category "${category}":

Title: ${title}

Problem Statement:
${markdown}

Generate the complete solution package. Output a strictly valid JSON object with these keys:
- "correctAnswer": The correct flag or answer.
- "explanation": A detailed explanation of how to solve it.
- "hintFileGeneratorCode": A Python script that generates the downloadable hint file (e.g., corrupted file, encoded text, zip file, pcap script generation logic) and writes it to the local directory. If no file is strictly needed, output a Python script that just writes a simple text hint to 'hint.txt'.

Output only the JSON. Do not include markdown code block wrappers like \`\`\`json.`;
  }

  if (!isCoding) {
    return `You are an expert technical problem setter. Given this ${mode} problem for category "${category}":

Title: ${title}

Problem Statement:
${markdown}

Generate the solution. Output a strictly valid JSON object with these keys:
- "correctAnswer": The correct answer.
- "explanation": A detailed explanation of why this is correct.

Output only the JSON. Do not include markdown code block wrappers like \`\`\`json.`;
  }

  return `You are an expert technical problem setter. Given this ${mode} problem for category "${category}":

Title: ${title}

Problem Statement:
${markdown}

Generate the complete solution package. Output a strictly valid JSON object with these keys:
- "optimalCode": The optimal solution in C++ (complete, includes standard libraries, reads stdin/writes stdout).
- "betterCode": A better solution in C++ (better than brute-force but maybe not the most optimal, e.g., using memoization or slightly less optimal time/space complexity).
- "bruteCode": A naive/brute-force solution in C++ (or a slightly less optimal one if brute force is not applicable).
- "testGenCode": A Python script that generates challenging test cases and prints them to stdout.

Output only the JSON. Do not include markdown code block wrappers like \`\`\`json.`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, category, mode, questionType, apiKey, stage = 'statement', title, markdown } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    const ai = createAI(apiKey);

    if (stage === 'statement') {
      if (!topic || !category || !mode) {
        return NextResponse.json({ error: 'Topic, category, and mode are required' }, { status: 400 });
      }

      const prompt = buildStatementPrompt({ category, mode, topic, questionType });
      const data = await generateJsonWithRetry(ai, prompt, statementSchema);

      return NextResponse.json({
        title: data.title,
        markdown: data.markdown,
        solutionsReady: false,
      });
    }

    if (stage === 'solutions') {
      if (!title || !markdown || !category || !mode) {
        return NextResponse.json({ error: 'Problem statement is required before generating solutions' }, { status: 400 });
      }

      const prompt = buildSolutionsPrompt({ category, mode, title, markdown, questionType });
      let targetSchema = answerSchema;
      if (questionType === 'Coding') targetSchema = codingSolutionsSchema;
      else if (mode === 'CTF') targetSchema = ctfSolutionsSchema;

      const data = await generateJsonWithRetry(
        ai,
        prompt,
        targetSchema
      );

      if (mode === 'CTF') {
        return NextResponse.json({
          title,
          markdown,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          hintFileGeneratorCode: data.hintFileGeneratorCode,
          solutionsReady: true,
          questionType
        });
      }

      if (questionType !== 'Coding') {
        return NextResponse.json({
          title,
          markdown,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          solutionsReady: true,
          questionType
        });
      }

      return NextResponse.json({
        title,
        markdown,
        optimalCode: data.optimalCode,
        betterCode: data.betterCode,
        bruteCode: data.bruteCode,
        testGenCode: data.testGenCode,
        solutionsReady: true,
        questionType
      });
    }

    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  } catch (error) {
    console.error('Error generating problem:', error);
    return NextResponse.json({ error: parseGeminiError(error) }, { status: 500 });
  }
}
