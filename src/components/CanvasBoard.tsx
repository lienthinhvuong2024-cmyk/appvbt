/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolType } from '../types';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CanvasBoardProps {
  file: File | null;
  tool: ToolType;
  color: string;
}

export interface CanvasBoardRef {
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  download: () => void;
  getCanvasImage: () => string | null;
}

export const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(({ file, tool, color }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const history = useRef<string[]>([]);
  const redoHistory = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (history.current.length > 1) {
        const current = history.current.pop()!;
        redoHistory.current.push(current);
        const last = history.current[history.current.length - 1];
        fabricCanvas.current?.loadFromJSON(JSON.parse(last)).then(() => {
          fabricCanvas.current?.requestRenderAll();
        });
      }
    },
    redo: () => {
      if (redoHistory.current.length > 0) {
        const next = redoHistory.current.pop()!;
        history.current.push(next);
        fabricCanvas.current?.loadFromJSON(JSON.parse(next)).then(() => {
          fabricCanvas.current?.requestRenderAll();
        });
      }
    },
    zoomIn: () => {
      const zoom = fabricCanvas.current?.getZoom() || 1;
      fabricCanvas.current?.setZoom(zoom * 1.1);
    },
    zoomOut: () => {
      const zoom = fabricCanvas.current?.getZoom() || 1;
      fabricCanvas.current?.setZoom(zoom / 1.1);
    },
    download: () => {
      if (!fabricCanvas.current) return;
      const dataURL = fabricCanvas.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
      const link = document.createElement('a');
      link.download = 'homework-completed.png';
      link.href = dataURL;
      link.click();
    },
    getCanvasImage: () => {
      return fabricCanvas.current?.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        multiplier: 1,
      }) || null;
    }
  }));

  const saveState = () => {
    if (!fabricCanvas.current) return;
    const json = JSON.stringify(fabricCanvas.current.toJSON());
    if (history.current[history.current.length - 1] !== json) {
      history.current.push(json);
      if (history.current.length > 50) history.current.shift();
      redoHistory.current = [];
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#f8fafc',
    });

    fabricCanvas.current = canvas;

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    // Zoom and Pan logic
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX: number;
    let lastPosY: number;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (tool === 'pan' || (evt.altKey)) {
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
            vpt[4] += e.clientX - lastPosX;
            vpt[5] += e.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
      }
    });

    canvas.on('mouse:up', () => {
      isDragging = false;
      canvas.selection = true;
    });

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas.current || !file) return;

    const loadFile = async () => {
      fabricCanvas.current?.clear();
      fabricCanvas.current!.backgroundColor = '#f8fafc';

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); // Load first page for now
        const viewport = page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas: canvas }).promise;
          const imgData = canvas.toDataURL('image/png');
          fabric.FabricImage.fromURL(imgData).then((img) => {
             // Center and scale image to fit canvas
             const canvasWidth = fabricCanvas.current!.width!;
             const canvasHeight = fabricCanvas.current!.height!;
             const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!) * 0.9;
             
             img.set({
               scaleX: scale,
               scaleY: scale,
               left: (canvasWidth - img.width! * scale) / 2,
               top: (canvasHeight - img.height! * scale) / 2,
               selectable: false,
               evented: false,
             });
             fabricCanvas.current?.add(img);
             fabricCanvas.current?.sendObjectToBack(img);
             saveState();
          });
        }
      } else {
        const reader = new FileReader();
        reader.onload = (f) => {
          const data = f.target?.result as string;
          fabric.FabricImage.fromURL(data).then((img) => {
            const canvasWidth = fabricCanvas.current!.width!;
            const canvasHeight = fabricCanvas.current!.height!;
            const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!) * 0.9;
            
            img.set({
              scaleX: scale,
              scaleY: scale,
              left: (canvasWidth - img.width! * scale) / 2,
              top: (canvasHeight - img.height! * scale) / 2,
              selectable: false,
              evented: false,
            });
            fabricCanvas.current?.add(img);
            fabricCanvas.current?.sendObjectToBack(img);
            saveState();
          });
        };
        reader.readAsDataURL(file);
      }
    };

    loadFile();
  }, [file]);

  useEffect(() => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;

    canvas.isDrawingMode = ['pen', 'highlighter'].includes(tool);
    
    if (canvas.isDrawingMode) {
      if (!canvas.freeDrawingBrush) {
         canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      
      canvas.freeDrawingBrush.color = tool === 'highlighter' ? `${color}44` : color;
      canvas.freeDrawingBrush.width = tool === 'highlighter' ? 20 : 3;
    }

    // Handle tool clicks
    const handleMouseDown = (options: any) => {
      if (['text', 'circle', 'check', 'cross'].includes(tool)) {
        const pointer = canvas.getScenePoint(options.e);
        
        let obj;
        if (tool === 'text') {
          obj = new fabric.IText('Nhấn để gõ...', {
            left: pointer.x,
            top: pointer.y,
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 20,
            fill: color,
          });
        } else if (tool === 'circle') {
          obj = new fabric.Circle({
            left: pointer.x - 25,
            top: pointer.y - 25,
            radius: 25,
            fill: 'transparent',
            stroke: color,
            strokeWidth: 2,
          });
        } else if (tool === 'check') {
          obj = new fabric.IText('✓', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 32,
            fill: '#16a34a',
            fontWeight: 'bold',
          });
        } else if (tool === 'cross') {
          obj = new fabric.IText('✗', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 32,
            fill: '#dc2626',
            fontWeight: 'bold',
          });
        }

        if (obj) {
          canvas.add(obj);
          canvas.setActiveObject(obj);
        }
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    
    // Eraser logic
    if (tool === 'eraser') {
      const handleEraser = (options: any) => {
        if (options.target && options.target.type !== 'image') {
          canvas.remove(options.target);
        }
      };
      canvas.on('mouse:down', handleEraser);
      return () => {
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('mouse:down', handleEraser);
      };
    }

    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [tool, color]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
});
