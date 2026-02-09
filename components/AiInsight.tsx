
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { HealthRecord } from '../types';
import { Sparkles, Loader2, MessageCircle } from 'lucide-react';

interface AiInsightProps {
  records: HealthRecord[];
}

const AiInsight: React.FC<AiInsightProps> = ({ records }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    if (records.length < 3) {
      alert('请至少记录3天的数据后再使用AI分析。');
      return;
    }

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const last7 = records.slice(0, 7).map(r => ({
        date: r.date,
        morning: r.morningWeight,
        evening: r.eveningWeight,
        bm: r.hasBM ? `Yes (${r.bmCount} times)` : 'No',
        notes: r.notes || ''
      }));

      const prompt = `
        作为健康顾问，请分析以下用户过去一周的体重和排便记录，给出简短、积极且专业的建议。
        关注：早晚体重波动是否过大（理想在1-2斤内）、排便频率、以及体重的长期趋势。
        数据：${JSON.stringify(last7)}
        语言：中文
        输出格式：直接输出建议文本，分段清晰。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
        //contents: prompt,
      });
      //gemini-3-flash-preview
      setInsight(response.text || '暂时无法生成建议。');
    } catch (error) {
      console.error(error);
      setInsight('生成建议时出错了，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-white/5 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Gemini AI 健康洞察</h3>
        </div>

        {!insight ? (
          <div className="space-y-4">
            <p className="text-indigo-100 text-sm leading-relaxed">
              基于您最近的体重变化和身体反馈，让智能助手为您提供个性化的健康建议和改善方案。
            </p>
            <button
              onClick={generateInsight}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg shadow-black/10 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  分析中...
                </>
              ) : (
                '获取建议'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm leading-relaxed border border-white/10 whitespace-pre-wrap">
              {insight}
            </div>
            <button
              onClick={() => setInsight(null)}
              className="text-xs font-bold text-indigo-100 hover:text-white transition flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              重新生成建议
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsight;
