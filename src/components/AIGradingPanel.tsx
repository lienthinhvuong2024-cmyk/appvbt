/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GradingResult } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIGradingPanelProps {
  result: GradingResult | null;
  onClose: () => void;
}

export const AIGradingPanel: React.FC<AIGradingPanelProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end p-6">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="bg-white w-full max-w-md h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Kết quả chấm bài AI</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Score Section */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - result.score / 10)}
                    strokeLinecap="round"
                    className="text-purple-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{result.score}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ 10 Điểm</span>
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                <span>Nhận xét tổng quát</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                "{result.feedback}"
              </p>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Chi tiết từng câu
              </h3>
              {result.details.map((detail, index) => (
                <div key={index} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {detail.status === 'correct' && <CheckCircle2 className="text-emerald-500" size={20} />}
                      {detail.status === 'incorrect' && <XCircle className="text-rose-500" size={20} />}
                      {detail.status === 'partial' && <AlertCircle className="text-amber-500" size={20} />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm mb-1">{detail.question}</div>
                      <p className="text-slate-500 text-xs leading-normal">{detail.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md active:scale-[0.98]"
            >
              Đã hiểu, quay lại
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
