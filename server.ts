/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import {createServer as createViteServer} from 'vite';
import {GoogleGenAI} from '@google/genai';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({limit: '50mb'}));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI Grading Endpoint
  app.post('/api/grade', async (req, res) => {
    try {
      const {image, homeworkTitle} = req.body;
      if (!image) {
        return res.status(400).json({error: 'No image data provided'});
      }

      const prompt = `
        Bạn là một giáo viên chuyên nghiệp. 
        Dưới đây là ảnh chụp bài tập của học sinh (đã bao gồm đề bài và nét vẽ/chữ viết tay của học sinh trên đó).
        Tên bài tập: ${homeworkTitle || 'Chưa xác định'}
        
        Hãy thực hiện:
        1. Phân tích các câu trả lời của học sinh.
        2. Chấm điểm (thang điểm 10).
        3. Đưa ra nhận xét chi tiết về những chỗ đúng và những lỗi sai.
        4. Gợi ý cách sửa hoặc kiến thức cần ôn tập.
        
        Trả về kết quả dưới định dạng JSON:
        {
          "score": number,
          "feedback": string,
          "details": [
            { "question": string, "status": "correct" | "incorrect" | "partial", "comment": string }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Using Pro for complex reasoning/vision
        contents: [
          {
            parts: [
              {text: prompt},
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: image.split(',')[1],
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('AI Grading Error:', error);
      res.status(500).json({error: error.message});
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, '');
        res.status(200).set({'Content-Type': 'text/html'}).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
