/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Pencil, 
  Highlighter, 
  Eraser, 
  Type, 
  Circle, 
  Check, 
  X, 
  Hand,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  BrainCircuit
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
  onGrade: () => void;
  isGrading: boolean;
}

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Yellow', value: '#facc15' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  color,
  setColor,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onDownload,
  onGrade,
  isGrading
}) => {
  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'pan', icon: <Hand size={20} />, label: 'Di chuyển' },
    { id: 'pen', icon: <Pencil size={20} />, label: 'Bút viết' },
    { id: 'highlighter', icon: <Highlighter size={20} />, label: 'Bút dạ quang' },
    { id: 'text', icon: <Type size={20} />, label: 'Văn bản' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Khoanh tròn' },
    { id: 'check', icon: <Check size={20} />, label: 'Tích đúng' },
    { id: 'cross', icon: <X size={20} />, label: 'Tích sai' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Tẩy' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-r border-slate-200 h-full w-20 items-center overflow-y-auto shadow-sm">
      <div className="flex flex-col gap-2 w-full">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
              activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="w-8 h-[1px] bg-slate-200 my-2" />

      <div className="flex flex-col gap-2">
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            title={c.name}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c.value ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="w-8 h-[1px] bg-slate-200 my-2" />

      <div className="flex flex-col gap-2">
        <button onClick={onUndo} title="Hoàn tác" className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl">
          <Undo2 size={20} />
        </button>
        <button onClick={onRedo} title="Làm lại" className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl">
          <Redo2 size={20} />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-slate-200 my-2" />

      <div className="flex flex-col gap-2">
        <button onClick={onZoomIn} title="Phóng to" className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl">
          <ZoomIn size={20} />
        </button>
        <button onClick={onZoomOut} title="Thu nhỏ" className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl">
          <ZoomOut size={20} />
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button 
          onClick={onGrade} 
          disabled={isGrading}
          title="AI Chấm điểm" 
          className={`p-3 rounded-xl transition-all ${
            isGrading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          <BrainCircuit size={20} className={isGrading ? 'animate-pulse' : ''} />
        </button>
        <button onClick={onDownload} title="Tải về" className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl border border-blue-100">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};
