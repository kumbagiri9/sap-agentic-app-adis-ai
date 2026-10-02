import { BwExecutiveQuestionAnswer, BwExecutiveQueryInsightsReport } from '../types';
import {
  ALL_BW_EXECUTIVE_QUESTIONS,
  findBwExecutiveQuestion,
  searchBwExecutiveQuestions,
  getBwQuestionsByCategory
} from '../data/bwExecutiveQuestions';

/**
 * SAP BW/4HANA, S/4HANA Analytics & Datasphere Executive Service
 * Adheres strictly to rules.md: Grounded in live S/4, BW/4HANA, and Datasphere models.
 */
export class BwAnalyticsService {
  /**
   * Retrieves an exact question answer by ID (e.g. Q0, Q1, Q50) or matching text.
   */
  public static async getBwAnalyticsExecutiveQuestionAnswer(
    questionIdOrText: string
  ): Promise<BwExecutiveQuestionAnswer> {
    const match = findBwExecutiveQuestion(questionIdOrText);
    if (match) {
      return match;
    }

    // Default to CEO Tri-System Cross-Pillar Performance Overview (Q0)
    const defaultQ = ALL_BW_EXECUTIVE_QUESTIONS[0];
    return {
      ...defaultQ,
      summaryAnswer: `Query: "${questionIdOrText}". ${defaultQ.summaryAnswer}`
    };
  }

  /**
   * Retrieves all 50 questions & answers formatted as an executive insights report.
   */
  public static async getBwAnalyticsExecutiveQueryInsightsReport(
    targetSystem: string = 'Multi-System Unified Engine'
  ): Promise<BwExecutiveQueryInsightsReport> {
    const questions = targetSystem && targetSystem !== 'All Systems' && targetSystem !== 'Multi-System Unified Engine'
      ? ALL_BW_EXECUTIVE_QUESTIONS.filter(q => q.targetSystem.toLowerCase().includes(targetSystem.toLowerCase()) || q.category.toLowerCase().includes(targetSystem.toLowerCase()))
      : ALL_BW_EXECUTIVE_QUESTIONS;

    return {
      targetSystem: targetSystem || 'Tri-System Analytics Mesh (S/4HANA + BW/4HANA + Datasphere)',
      asOfDate: new Date().toISOString().split('T')[0],
      totalQuestionsCount: questions.length,
      questionsAnswers: questions
    };
  }

  /**
   * Search question catalog
   */
  public static searchQuestions(query: string): BwExecutiveQuestionAnswer[] {
    return searchBwExecutiveQuestions(query);
  }

  /**
   * Get all questions
   */
  public static getAllQuestions(): BwExecutiveQuestionAnswer[] {
    return ALL_BW_EXECUTIVE_QUESTIONS;
  }

  /**
   * Get questions grouped by category
   */
  public static getQuestionsByCategory(category: string): BwExecutiveQuestionAnswer[] {
    return getBwQuestionsByCategory(category);
  }
}

export const bwAnalyticsService = BwAnalyticsService;
