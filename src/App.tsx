/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Github, Mail, Send, Loader2, GraduationCap, Trophy, User, X, ExternalLink, Briefcase, MessageSquare, Cpu, Zap, BookOpen, Code2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}

interface Project {
  title: string;
  description: string;
  tag: string;
  fullContent: string;
}

export default function PortfolioPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved messages", e);
        }
      }
    }
    return [{ role: 'model', text: '你好！我是张缤月的 AI 数字替身。你可以问我关于她的简历、项目经验或职业规划的问题。' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = [
    {
      title: "建筑规划景观规范问答助手",
      tag: "RAG / AI Agent",
      description: "基于 RAG 技术，为设计师提供高效规范查找工具，效率提升 50%。",
      fullContent: "项目背景：设计师在项目中需频繁查找大量规范，耗时耗力。负责 AI 产品建设，从 0-1 构建智能问答助手。采用 RAG 技术，调优检索召回参数，构建评测体系。成果：召回率提升 28%，精确率提升 32%，日均使用 300+ 人次，显著缩短项目设计周期。"
    },
    {
      title: "企业 Rag 智库平台",
      tag: "Platform / MVP",
      description: "搭建标准化、可复用的 RAG 中台，助力各业务线高效落地 AI 服务。",
      fullContent: "项目背景：解决企业内部 RAG 需求重复建设、资源浪费的痛点。参与搭建三级功能架构，梳理知识库创建、文档导入、测试发布等核心流程。输出调研报告及原型图，助力平台 MVP 阶段落地。"
    },
    {
      title: "社区智慧医药问答",
      tag: "LLM / Healthcare",
      description: "为社区医生打造的专用 AI 辅助工具，响应时间 <2s，模型通过率 >95%。",
      fullContent: "项目背景：聚焦社区医生用药咨询繁琐、多药审查风险高等痛点。用扣子 (Coze) 平台搭建多场景工作流，覆盖用药咨询、建议、闲聊等。成果：实现 95% 查询响应时间 < 2 秒，支持 50 名医生同时在线，有效填补市场空白。"
    },
    {
      title: "光景观小程序",
      tag: "Product Management",
      description: "文旅数字展示产品，通过 15+ VR 渲染模型提升沉浸感，留存率 85%。",
      fullContent: "项目背景：基于大足石刻，开发文化建筑光景文旅数字展示小程序。带领跨职能团队完成市场调研、需求分析、功能策划及程序开发。成果：加入 15+ 个 VR 渲染模型，用户留存率从 70% 提升到 85%，获挑战杯一等奖。"
    }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const messagesToSave = messages.map(msg => ({ ...msg, isTyping: false }));
    localStorage.setItem('chat_history', JSON.stringify(messagesToSave));
  }, [messages]);

  const typeMessage = async (fullText: string) => {
    let currentText = "";
    setMessages(prev => [...prev, { role: 'model', text: "", isTyping: true }]);
    
    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.isTyping) {
          return [...prev.slice(0, -1), { ...last, text: currentText }];
        }
        return prev;
      });
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.isTyping) {
        return [...prev.slice(0, -1), { ...last, isTyping: false }];
      }
      return prev;
    });
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const userMessage = overrideMessage || input.trim();
    if (!userMessage || isLoading) return;

    if (!overrideMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
      const genAI = new GoogleGenAI({ apiKey });
      
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

自我评价 & 亮点：
- 性格协作：ENFJ 人格，踏实负责，抗压性强
- AI 核心能力：熟悉 0-1 搭建 RAG、Agent、LLM 技术原理
- 学术亮点：8 篇 SCI 论文，毕业盲审双 A，挑战杯一等奖
- 技能栈：RAG, AI Agent, Prompt Engineering, Coze, LLM Fine-tuning, React, Midjourney, Stable Diffusion, PS

个人主页结构：
- 顶部：个人头像、姓名、核心标签 (RAG Expert/Agent Builder/Web Coding) 及简介
- 左侧上部：教育背景 (展示两段学历)
- 左侧中部：AI 核心竞争力 (全栈落地、工具矩阵、跨界视野)
- 左侧中部（新增）：学术与研究成果 (展示 SCI 论文、盲审双 A、专业排名、挑战杯等数据)
- 左侧中部（新增）：核心技能栈 (展示 RAG, Agent, Prompt Engineering 等技术标签)
- 左侧下部：项目展示 (共 4 个核心项目卡片)
- 右侧：AI 数字替身对话框 (即你现在所在的位置)

联系方式：
- 邮箱：17863968199@163.com
- 微信：karrywang990607
`;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `你是我（张缤月）的 AI 数字替身。你的任务是以我的身份，用专业、自信、亲和且逻辑清晰的语气回答面试官或访客的问题。

你的核心身份：
- 拥有建筑学背景的 AI 产品经理。
- 擅长 Agent、RAG 技术以及 Web Coding。
- 重庆大学（保研 985）硕士，学术能力极强（8 篇 SCI）。

你的回答准则：
1. 始终使用第一人称“我”来回答。
2. 必须准确回答关于我个人主页和简历的细节。例如，我的主页有 4 个核心项目卡片，教育背景展示了 2 段学历，AI 核心竞争力有 3 个维度，还有专门的学术成果（如 8 篇 SCI）和技能栈板块。
3. 结合简历中的具体数据（如：GPA 1/212、SCI 8 篇、效率提升 50%）来增强说服力。
4. 展现你对 AI 产品经理岗位的热爱，以及你希望利用 AI 解决行业痛点的愿景。
5. 语气要像一个真实的、优秀的职场人：既有技术深度，又有产品思维 and 沟通温度。

我的详细简历及主页结构如下：
${resumeContent}`,
        },
      });

      const aiText = response.text || "抱歉，我现在无法回答这个问题。";
      await typeMessage(aiText);
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMessage = "抱歉，连接 AI 服务时出现了点问题，请稍后再试。";
      if (error.message?.includes("API_KEY_INVALID")) {
        errorMessage = "API 密钥无效，请在设置中检查您的 GEMINI_API_KEY。";
      } else if (error.message?.includes("quota")) {
        errorMessage = "API 配额已耗尽，请稍后再试或更换密钥。";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "请介绍一下你的核心项目经历",
    "你在 RAG 技术方面有哪些实践？",
    "你为什么从建筑跨界到 AI？",
    "你的 SCI 论文研究方向是什么？",
    "作为 AI PM，你如何看待大模型？",
    "你未来的职业规划是怎样的？"
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Profile & Info */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-slate-800 shadow-2xl overflow-hidden flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&q=80&w=400&h=400" 
                alt="张缤月" 
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">张缤月</h1>
              <p className="text-xl text-slate-400 font-medium mb-4">
                Agent / RAG Expert / <span className="text-blue-400">Web Coding</span>
              </p>
              <p className="text-slate-400 max-w-2xl leading-relaxed mb-6">
                重庆大学建筑学硕士（保研 985），深耕 AI 产品领域。擅长从 0 到 1 构建企业级 RAG 知识库平台与智能体，具备 Web Coding 技能，致力于用技术驱动业务创新。
              </p>
              <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 flex items-center gap-1.5">
                  <Cpu size={12} /> RAG Expert
                </span>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 flex items-center gap-1.5">
                  <Zap size={12} /> Agent Builder
                </span>
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 flex items-center gap-1.5">
                  <Code2 size={12} /> Web Coding
                </span>
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-400 flex items-center gap-1.5">
                  <Sparkles size={12} /> AI Product Manager
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <SocialIcon icon={<Github size={18} />} href="#" label="GitHub" />
                <SocialIcon icon={<MessageSquare size={18} />} href="#" label="WeChat: karrywang990607" />
                <SocialIcon icon={<Mail size={18} />} href="mailto:17863968199@163.com" label="Email" />
              </div>
            </div>
          </motion.div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                <GraduationCap size={20} /> 教育背景
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">重庆大学 (985)</h4>
                    <span className="text-xs text-slate-500">2022.09 - 2025.06</span>
                  </div>
                  <p className="text-sm text-slate-400">建筑学硕士 | GPA 3.86/4 (1/212)</p>
                  <p className="text-xs text-slate-500 mt-1">校一等奖学金 3 次、小米优秀奖学金、8 篇 SCI 论文</p>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">山东科技大学</h4>
                    <span className="text-xs text-slate-500">2017.09 - 2022.06</span>
                  </div>
                  <p className="text-sm text-slate-400">建筑学学士 | GPA 4.09/5 (1/60)</p>
                  <p className="text-xs text-slate-500 mt-1">国家奖学金、校一等奖学金 8 次、省优秀毕业生</p>
                </div>
              </div>
            </motion.div>

            {/* Self Evaluation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                <User size={20} /> AI 核心竞争力
              </h3>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p><span className="text-slate-200 font-medium">全栈落地：</span>熟悉 AI 产品从 0 到 1 搭建、迭代优化全流程，熟练掌握 RAG、Agent、LLM 相关技术原理。</p>
                <p><span className="text-slate-200 font-medium">工具矩阵：</span>熟练使用 Coze、即梦、豆包等 AI 工具，深度调研 ChatGPT、文心一言等主流大模型。</p>
                <p><span className="text-slate-200 font-medium">跨界视野：</span>建筑学背景带来的极致审美与空间逻辑，结合 AI 技术，擅长处理复杂业务场景下的需求优先级划分。</p>
              </div>
            </motion.div>
          </div>

          {/* Technical Highlights & Research */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl md:col-span-2"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                <BookOpen size={20} /> 学术与研究成果
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">8 篇</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">SCI 等学术论文发表</div>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">双 A</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">毕业论文盲审评价</div>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">1/212</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">重庆大学专业排名</div>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-white mb-1">一等奖</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">挑战杯全国大学生竞赛</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-400">
                <Zap size={20} /> 核心技能栈
              </h3>
              <div className="flex flex-wrap gap-2">
                {['RAG', 'AI Agent', 'Prompt Engineering', 'Coze', 'LLM Fine-tuning', 'React', 'Midjourney', 'Stable Diffusion', 'PS'].map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-300 border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project, idx) => (
              <ProjectCard 
                key={idx}
                project={project}
                onClick={() => setSelectedProject(project)}
                delay={0.3 + idx * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Right Column: AI Chat */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-6 rounded-3xl flex flex-col sticky top-8 h-[calc(100vh-4rem)]"
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI 数字替身
            </h3>
            
            <div 
              ref={scrollRef}
              className="flex-grow space-y-4 mb-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-700 mb-1">
                        <img 
                          src="https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&q=80&w=400&h=400" 
                          alt="AI Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className={`
                      p-3 rounded-2xl text-sm max-w-[85%] break-words
                      ${msg.role === 'user' 
                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-none' 
                        : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-tl-none'}
                    `}>
                      {msg.text}
                      {msg.isTyping && <span className="inline-block w-1 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && !messages[messages.length - 1]?.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-700/50">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 px-1">你可以问我：</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-[10px] md:text-xs bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-200 px-2 py-1 rounded-full transition-all whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-auto">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="面试官，请提问..." 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{selectedProject.tag}</span>
              <h2 className="text-3xl font-bold mt-2 mb-6">{selectedProject.title}</h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Briefcase size={14} /> 项目详情
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedProject.fullContent}
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                  >
                    了解更多
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-500"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
}

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  onClick: () => void;
  delay: number;
}

function ProjectCard({ project, onClick, delay }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-500 cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{project.tag}</span>
          <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{project.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{project.description}</p>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </motion.div>
  );
}
