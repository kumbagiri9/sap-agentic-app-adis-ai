import { EhsExecutiveQuestionAnswer } from '../types';
import { EHS_EXECUTIVE_QUESTIONS_PART1 } from './ehsExecutiveQuestionsPart1';
import { EHS_EXECUTIVE_QUESTIONS_PART2 } from './ehsExecutiveQuestionsPart2';

export const ALL_EHS_EXECUTIVE_QUESTIONS: EhsExecutiveQuestionAnswer[] = [
  ...EHS_EXECUTIVE_QUESTIONS_PART1,
  ...EHS_EXECUTIVE_QUESTIONS_PART2
];

export const EHS_QUESTION_CATEGORIES = [
  'Incidents & Safety Events',
  'Incident Investigation',
  'Risk Assessment & Hazards',
  'Occupational Health & Exposure',
  'Environmental & Compliance'
] as const;

export function findEhsExecutiveQuestion(query: string): EhsExecutiveQuestionAnswer | undefined {
  if (!query || !query.trim()) return undefined;
  const qClean = query.trim().toLowerCase().replace(/[?.,!]/g, '');

  // Exact ID matching (e.g. "q1", "ehs1", "q10", "ehs50")
  const idMatch = qClean.match(/^(?:q|ehs)\s*(\d+)$/i);
  if (idMatch) {
    const num = parseInt(idMatch[1], 10);
    if (num >= 1 && num <= 50) {
      const found = ALL_EHS_EXECUTIVE_QUESTIONS.find(item => item.questionId.toLowerCase() === `q${num}`);
      if (found) return found;
    }
  }

  // Exact text matching
  const exactMatch = ALL_EHS_EXECUTIVE_QUESTIONS.find(
    item => item.questionText.toLowerCase().replace(/[?.,!]/g, '') === qClean
  );
  if (exactMatch) return exactMatch;

  // Fuzzy / Keyword scoring
  let bestMatch: EhsExecutiveQuestionAnswer | undefined;
  let bestScore = 0;

  for (const q of ALL_EHS_EXECUTIVE_QUESTIONS) {
    const candidateText = q.questionText.toLowerCase();
    const candidateWords = candidateText.replace(/[?.,!]/g, '').split(/\s+/);
    const queryWords = qClean.split(/\s+/).filter(w => w.length > 2);

    let matchCount = 0;
    for (const qw of queryWords) {
      if (candidateWords.some(cw => cw.includes(qw) || qw.includes(cw))) {
        matchCount++;
      }
    }

    const score = queryWords.length > 0 ? matchCount / queryWords.length : 0;
    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = q;
    }
  }

  return bestMatch;
}

export function searchEhsExecutiveQuestions(searchTerm: string): EhsExecutiveQuestionAnswer[] {
  if (!searchTerm || !searchTerm.trim()) return ALL_EHS_EXECUTIVE_QUESTIONS;
  const term = searchTerm.toLowerCase();

  return ALL_EHS_EXECUTIVE_QUESTIONS.filter(q => 
    q.questionText.toLowerCase().includes(term) ||
    q.summaryAnswer.toLowerCase().includes(term) ||
    q.category.toLowerCase().includes(term) ||
    q.sapSourceTables.some(t => t.toLowerCase().includes(term)) ||
    q.keyInsights.some(i => i.toLowerCase().includes(term))
  );
}

export function getEhsQuestionsByCategory(category: string): EhsExecutiveQuestionAnswer[] {
  return ALL_EHS_EXECUTIVE_QUESTIONS.filter(q => q.category.toLowerCase() === category.toLowerCase());
}
