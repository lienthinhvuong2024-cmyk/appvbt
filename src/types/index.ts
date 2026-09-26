/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text' | 'circle' | 'check' | 'cross' | 'pan';

export interface GradingResult {
  score: number;
  feedback: string;
  details: {
    question: string;
    status: 'correct' | 'incorrect' | 'partial';
    comment: string;
  }[];
}
