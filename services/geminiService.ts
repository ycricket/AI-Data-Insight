import { GoogleGenAI } from "@google/genai";
import { SAMPLE_ASSETS } from "../constants";

// Helper to format schema for the prompt
const getSchemaContext = () => {
  return SAMPLE_ASSETS.map(asset => {
    const fields = asset.schema.map(f => `${f.name} (${f.type})`).join(', ');
    return `表名: ${asset.id} (${asset.name})\n字段: ${fields}`;
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
    1. 仅输出SQL查询语句。不要包含 markdown 代码块（如 \`\`\`sql），不要包含解释或注释。
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
        temperature: 0.1, // Low temperature for deterministic code generation
      },
    });

    return response.text.trim().replace(/```sql|```/g, ''); // Cleanup just in case
  } catch (error) {
    console.error("Gemini SQL Generation Error:", error);
    throw new Error("生成 SQL 失败，请重试。");
  }
};

export const analyzeDataInsights = async (dataSample: any[]): Promise<string> => {
  if (!process.env.API_KEY) return "缺少 API Key。";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Take a small sample to avoid token limits
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
