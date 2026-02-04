
import { GoogleGenAI, Type } from "@google/genai";
import { SAMPLE_ASSETS } from "../constants";
import { DataAsset } from "../types";

// Helper to format schema for the prompt
const getSchemaContext = (asset?: DataAsset) => {
  if (asset) {
    return `当前操作表: ${asset.id}\n表名称: ${asset.name}\nSchema:\n${asset.schema.map(f => `- ${f.name} (${f.type}): ${f.description || ''}`).join('\n')}`;
  }
  return SAMPLE_ASSETS.map(asset => {
    return `ID: ${asset.id}\n名称: ${asset.name}\n分类: ${asset.category}\n描述: ${asset.description}`;
  }).join('\n\n');
};

export const generateSqlFromText = async (userPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("环境变量中未找到 API Key。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schemaContext = getSchemaContext();

  const systemInstruction = `
    你是一个空间数据分析平台的SQL专家。
    你的目标是将用户的自然语言（可能是中文）转换为基于提供的Schema的有效SQL查询。
    
    规则:
    1. 仅输出SQL查询语句。不要包含 markdown 代码块（如 \`\`\`sql\`), 不要包含解释或注释。
    2. 除非用户指定，否则默认限制结果为 100 条 (LIMIT 100)。
    3. 如果用户请求空间数据或地图展示，确保选择 lat/lng 字段。
    4. 模糊搜索时请使用 LIKE。
    
    数据库 Schema:
    ${schemaContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text.trim().replace(/```sql|```/g, '');
  } catch (error) {
    console.error("Gemini SQL Generation Error:", error);
    throw new Error("生成 SQL 失败，请重试。");
  }
};

export interface AnalysisResponse {
  answer: string;
  sql?: string;
}

export const analyzeWithChat = async (userQuery: string, currentAsset: DataAsset): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) throw new Error("缺少 API Key");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schemaContext = getSchemaContext(currentAsset);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userQuery,
    config: {
      systemInstruction: `
        你是一个专业的数据分析专家。用户正在查看并分析数据集: ${currentAsset.name} (${currentAsset.id})。
        
        该表的结构如下:
        ${schemaContext}

        你的任务：
        1. 解析用户的问题或分析需求。
        2. 如果需求可以通过 SQL 查询实现（如过滤、统计、排序），请生成对应的 SQL 语句。
        3. 给出简洁专业的中文回答，解释你做了什么或对数据的初步看法。

        必须以 JSON 格式返回，包含：
        - "answer": 对用户的文字回复。
        - "sql": 生成的完整 SQL 查询语句（如果不需要查询则不返回此字段）。
      `,
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { answer: "抱歉，分析过程中出现了逻辑错误，请尝试换一种说法。" };
  }
};

export const analyzeDataInsights = async (dataSample: any[]): Promise<string> => {
  if (!process.env.API_KEY) return "缺少 API Key。";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sampleStr = JSON.stringify(dataSample.slice(0, 10));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析这个数据集样本（提供了前10行），并用中文提供3个关于数据分布或异常值的简短要点。数据: ${sampleStr}`,
    });
    return response.text;
  } catch (error) {
    return "无法生成洞察分析。";
  }
};

export const consultDataAssets = async (userQuery: string): Promise<{ answer: string; recommendedIds: string[] }> => {
  if (!process.env.API_KEY) throw new Error("缺少 API Key");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const catalogContext = getSchemaContext();

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userQuery,
    config: {
      systemInstruction: `
        你是一个专业的数据资源管家。你的任务是根据用户对数据的描述或需求，从下面的资源目录中挑选出最相关的 1-3 个数据集。
        
        资源目录：
        ${catalogContext}

        回答规则：
        1. 必须以 JSON 格式返回。
        2. 格式包含：
           - "answer": 对用户的友好回答（中文），简述为什么推荐这些数据。
           - "recommendedIds": 一个包含匹配的数据集 ID 的字符串数组。
        3. 如果没有匹配的数据，recommendedIds 返回空数组。
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          recommendedIds: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["answer", "recommendedIds"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { answer: "抱歉，解析建议时出现错误。", recommendedIds: [] };
  }
};
