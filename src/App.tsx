/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasBoard, CanvasBoardRef } from './components/CanvasBoard';
import { FileUploader } from './components/FileUploader';
import { AIGradingPanel } from './components/AIGradingPanel';
import { ToolType, GradingResult } from './types';
import { BookOpen, GraduationCap, Github } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#000000');
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  
  const canvasBoardRef = useRef<CanvasBoardRef>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleGrade = async () => {
    if (!canvasBoardRef.current) return;
    
    setIsGrading(true);
    const imageData = canvasBoardRef.current.getCanvasImage();
    
    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          homeworkTitle: file?.name
        })
      });
      
      const data = await response.json();
      setGradingResult(data);
      
      if (data.score >= 8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Grading failed:', error);
      alert('Đã có lỗi xảy ra khi chấm bài. Vui lòng thử lại.');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header Contract: 3-zone */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-10 shrink-0">
        {/* Zone 1: Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            EduCanvas
          </h1>
        </div>

        {/* Zone 2: Navigation Links (Clean text) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Tài liệu</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Thư viện đề</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Hướng dẫn</a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Github size={18} />
            <span>Open Source</span>
          </a>
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm">
            Đăng nhập
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="mb-12 text-center max-w-2xl">
              <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight">
                Biến mọi bài tập giấy thành <span className="text-blue-600">tương tác kỹ thuật số</span>
              </h2>
              <p className="text-lg text-slate-600">
                Chỉ cần tải lên ảnh chụp bài tập, học sinh có thể vẽ, viết và nhận phản hồi tức thì từ AI ngay trên màn hình.
              </p>
            </div>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <>
            <Toolbar 
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              color={color}
              setColor={setColor}
              onUndo={() => canvasBoardRef.current?.undo()}
              onRedo={() => canvasBoardRef.current?.redo()}
              onZoomIn={() => canvasBoardRef.current?.zoomIn()}
              onZoomOut={() => canvasBoardRef.current?.zoomOut()}
              onDownload={() => canvasBoardRef.current?.download()}
              onGrade={handleGrade}
              isGrading={isGrading}
            />
            
            <div className="flex-1 relative">
              <CanvasBoard 
                ref={canvasBoardRef}
                file={file}
                tool={activeTool}
                color={color}
              />

              {/* Context Bar */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600" />
                    <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-slate-300" />
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs font-bold text-red-500 hover:text-red-600"
                  >
                    Đổi bài tập
                  </button>
                </div>

                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto text-xs text-slate-500 font-medium">
                  Phóng to: <kbd className="bg-slate-100 px-1 rounded">Ctrl + Wheel</kbd> · Di chuyển: <kbd className="bg-slate-100 px-1 rounded">Alt + Drag</kbd>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AIGradingPanel 
        result={gradingResult} 
        onClose={() => setGradingResult(null)} 
      />
    </div>
  );
}
