import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in the Secrets panel.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Full resume content for the AI to use
  const resumeContent = `
姓名：张缤月
教育背景：
1. 重庆大学 (保研 985) | 建筑学硕士 (2022.09 - 2025.06)
   - GPA: 3.86/4 (专业排名 1/212)
   - 荣誉：校一等奖学金 3 次，小米优秀奖学金，重庆大学优秀毕业生
   - 学术：发表 8 篇 SCI 等学术论文，毕业盲审双 A
2. 山东科技大学 | 建筑学学士 (五年制) (2017.09 - 2022.06)
   - GPA: 4.09/5 (专业排名 1/60)
   - 荣誉：国家奖学金 1 次，校一等奖学金 8 次，山东省优秀毕业生

核心项目经历 (共 4 个)：
1. 建筑规划景观规范问答助手 (重庆大学建筑规划设计研究总院)
   - 核心技术：RAG, AI Agent
   - 成果：召回率提升 28%，精确率提升 32%，效率提升 50%
2. 企业 Rag 智库平台 (MVP 阶段)
   - 核心技术：RAG 中台, 三级功能架构
   - 成果：解决重复建设痛点，输出标准化流程
3. 社区智慧医药问答 Agent 助手
   - 核心技术：LLM, Coze 工作流
   - 成果：95% 响应时间 < 2s，支持 50 名医生在线
4. “光渝·光遇”光景观小程序
   - 核心技术：VR 渲染, 数字展示
   - 成果：用户留存率从 70% 提升到 85%，获挑战杯一等奖

自我评价：
- 性格协作：ENFJ 人格，踏实负责，抗压性强
- AI 核心能力：熟悉 0-1 搭建 RAG、Agent、LLM 技术原理
- 通用能力：竞品分析、需求优先级划分、项目统筹、文字功底扎实

个人主页结构：
- 顶部：个人头像、姓名、核心标签 (Agent/RAG/Web Coding) 及简介
- 左侧上部：教育背景 (展示两段学历)
- 左侧中部：自我评价 (三个核心维度)
- 左侧下部：项目展示 (共 4 个核心项目卡片)
- 右侧：AI 数字替身对话框 (即你现在所在的位置)
`;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
