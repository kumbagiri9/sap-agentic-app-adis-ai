import { BwExecutiveQuestionAnswer } from '../types';
import { BW_EXECUTIVE_QUESTIONS_PART1 } from './bwExecutiveQuestionsPart1';
import { BW_EXECUTIVE_QUESTIONS_PART2 } from './bwExecutiveQuestionsPart2';

export const ALL_BW_EXECUTIVE_QUESTIONS: BwExecutiveQuestionAnswer[] = [
  ...BW_EXECUTIVE_QUESTIONS_PART1,
  ...BW_EXECUTIVE_QUESTIONS_PART2
];

export const BW_QUESTION_CATEGORIES = [
  'Executive & Business Analytics',
  'BW/4HANA Questions',
  'BW Data Load & ETL Questions',
  'S/4HANA Embedded Analytics',
  'SAP Datasphere Questions'
] as const;

export function findBwExecutiveQuestion(identifier: string): BwExecutiveQuestionAnswer | undefined {
  if (!identifier) return undefined;
  const cleanId = identifier.trim().toUpperCase();
  
  // Exact ID match (Q0, Q1, Q50, BW01, etc.)
  const exact = ALL_BW_EXECUTIVE_QUESTIONS.find(q => 
    q.questionId.toUpperCase() === cleanId ||
    q.questionId.toUpperCase() === `Q${cleanId}` ||
    `BW${q.questionId.toUpperCase()}` === cleanId
  );
  if (exact) return exact;

  // Question text search
  const lowerText = identifier.trim().toLowerCase();
  return ALL_BW_EXECUTIVE_QUESTIONS.find(q => 
    q.questionText.toLowerCase().includes(lowerText) ||
    lowerText.includes(q.questionText.toLowerCase())
  );
}

export function searchBwExecutiveQuestions(query: string): BwExecutiveQuestionAnswer[] {
  if (!query || query.trim() === '') return ALL_BW_EXECUTIVE_QUESTIONS;
  const lower = query.toLowerCase().trim();
  return ALL_BW_EXECUTIVE_QUESTIONS.filter(q =>
    q.questionId.toLowerCase().includes(lower) ||
    q.questionText.toLowerCase().includes(lower) ||
    q.category.toLowerCase().includes(lower) ||
    q.targetSystem.toLowerCase().includes(lower) ||
    q.summaryAnswer.toLowerCase().includes(lower) ||
    q.keyInsights.some(k => k.toLowerCase().includes(lower)) ||
    q.sapTechnicalTarget.toLowerCase().includes(lower)
  );
}

export function getBwQuestionsByCategory(category: string): BwExecutiveQuestionAnswer[] {
  return ALL_BW_EXECUTIVE_QUESTIONS.filter(q => q.category === category);
}
