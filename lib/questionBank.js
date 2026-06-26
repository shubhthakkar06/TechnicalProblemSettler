import { standardQuestions } from '@/lib/standardQuestions';
import { ctfReadyQuestions } from '@/lib/ctfReadyQuestions';

const CODING_SLUGS = new Set(['dsa', 'cp', 'web-dev', 'app-dev', 'os-systems']);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function codingMarkdown({ title, categoryName, subcategory, topic }) {
  return `# ${title}

## Problem Statement

You are given a task based on **${topic}** from **${subcategory}** in ${categoryName}. Build a solution that handles practical interview constraints, edge cases, and clear input/output behavior.

Design and implement an efficient algorithm for the following:

Given an input collection related to ${topic.toLowerCase()}, compute the required result while keeping the solution scalable and easy to reason about.

## Input Format

- The first line contains an integer \`n\`, the number of items.
- The next line or block contains the data needed for the ${topic.toLowerCase()} task.
- Additional parameters may be provided depending on the exact variation.

## Output Format

Print the required result for the given input.

## Constraints

- \`1 <= n <= 2 * 10^5\`
- Values fit in 64-bit signed integers unless stated otherwise.
- The expected solution should be better than naive brute force when possible.

## Interview Focus

- Explain the core idea behind ${topic}.
- Discuss time and space complexity.
- Mention at least two edge cases.
- Compare the optimal approach with a brute-force approach.`;
}

function mcqMarkdown({ title, topic }) {
  return `# ${title}

Which statement best describes **${topic}** in a technical interview context?

A. It is mainly a syntax feature and rarely affects system behavior.

B. It is a core concept whose tradeoffs, edge cases, and complexity should be understood before implementation.

C. It is only relevant for theoretical exams and not practical engineering.

D. It can always be solved with brute force without considering constraints.`;
}

function predictOutputMarkdown({ title, topic }) {
  return `# ${title}

Predict the output of this snippet and explain why it behaves that way.

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> values = {1, 2, 3, 4};
    int answer = 0;
    for (int x : values) {
        if (x % 2 == 0) answer += x;
        else answer -= x;
    }
    cout << answer << "\\n";
    return 0;
}
\`\`\`

Focus your explanation on the reasoning pattern used in **${topic}** questions.`;
}

function conceptualMarkdown({ title, categoryName, subcategory, topic }) {
  return `# ${title}

Explain **${topic}** as it applies to ${categoryName}.

Your answer should cover:

- The core idea in simple terms.
- Why it matters in ${subcategory}.
- A realistic example.
- Common mistakes candidates make.
- How you would evaluate whether a candidate truly understands it.`;
}

function buildQuestion({ slug, categoryName, subcategory, topic, index, questionType }) {
  const type = questionType || (CODING_SLUGS.has(slug) ? 'Coding' : 'Conceptual');
  const title =
    type === 'MCQ'
      ? `${topic}: Interview MCQ`
      : type === 'Predict Output'
        ? `${topic}: Predict the Output`
        : type === 'Conceptual'
          ? `${topic}: Interview Deep Dive`
          : `${topic}: Interview Challenge`;

  const common = {
    id: `${slug}-${slugify(subcategory)}-${slugify(topic)}-${slugify(type)}-${index}`,
    title,
    category: categoryName,
    subcategory,
    topic,
    questionType: type,
    source: 'bank',
    readyToDownload: true,
  };

  if (type === 'MCQ') {
    return {
      ...common,
      markdown: mcqMarkdown({ title, topic }),
      correctAnswer: 'B',
      explanation: `${topic} is best evaluated through tradeoffs, constraints, edge cases, and practical application.`,
      solutionsReady: true,
    };
  }

  if (type === 'Predict Output') {
    return {
      ...common,
      markdown: predictOutputMarkdown({ title, topic }),
      correctAnswer: '2',
      explanation: 'The loop subtracts odd values and adds even values: -1 + 2 - 3 + 4 = 2.',
      solutionsReady: true,
    };
  }

  if (type === 'Conceptual') {
    return {
      ...common,
      markdown: conceptualMarkdown({ title, categoryName, subcategory, topic }),
      correctAnswer: `A strong answer should define ${topic}, connect it to a practical scenario, and discuss tradeoffs or failure modes.`,
      explanation: `This is a ready interview prompt for ${topic}. It is meant to test depth, clarity, examples, and judgment.`,
      solutionsReady: true,
    };
  }

  return {
    ...common,
    markdown: codingMarkdown({ title, categoryName, subcategory, topic }),
    solutionsReady: false,
  };
}

export function getReadyQuestionGroups(slug, categoryName, questionType) {
  if (slug === 'ctf' && questionType) {
    const ctfKey = questionType.toLowerCase().replace(/\s+/g, '-');
    const questions = ctfReadyQuestions[ctfKey];
    if (questions && questions.length > 0) {
      return [{
        name: questionType,
        questions: questions
      }];
    }
    return [];
  }

  const groups = standardQuestions[slug] || [];

  return groups.map((group) => ({
    name: group.name,
    questions: group.topics.slice(0, 10).map((topic, index) =>
      buildQuestion({
        slug,
        categoryName,
        subcategory: group.name,
        topic,
        index,
        questionType,
      })
    ),
  }));
}
