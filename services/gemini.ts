
import { GoogleGenAI, Type } from "@google/genai";
import { SAMPLE_ASSETS } from "../constants";
import { DataAsset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 格式化 Schema 上下文，供 Prompt 使用
 */
const formatSchemaContext = (asset?: DataAsset) => {
  if (asset) {
    return `表 ID: ${asset.id}\n名称: ${asset.name}\n结构:\n${asset.schema.map(f => `- ${f.name} (${f.type}): ${f.description || ''}`).join('\n')}`;
  }
  return SAMPLE_ASSETS.map(a => `ID: ${a.id}, 名称: ${a.name}, 描述: ${a.description}`).join('\n');
};

/**
 * 工作台：对话式分析引擎
 */
export const analyzeDataIntent = async (userQuery: string, currentAsset: DataAsset) => {
  const schemaContext = formatSchemaContext(currentAsset);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userQuery,
    config: {
      systemInstruction: `你是一个空间地理数据专家。当前数据集: ${currentAsset.name}\n${schemaContext}\n\n任务：理解需求，返回 JSON。\n- answer: 中文解释\n- sql: 如果涉及查询，生成完整 SQL。`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          sql: { type: Type.STRING }
        },
        required: ["answer"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * 资产中心：智能管家咨询
 */
export const consultCatalog = async (userQuery: string) => {
  const catalogContext = formatSchemaContext();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userQuery,
    config: {
      systemInstruction: `你是资源管家。目录如下：\n${catalogContext}\n返回 JSON：answer (回复), recommendedIds (匹配的 ID 数组)。`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["answer", "recommendedIds"]
      }
    }
  });
  return JSON.parse(response.text);
};
