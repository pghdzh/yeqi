import axios from "axios";

const API_KEY = "sk-749495b62f9d4c04a0d7a6688b6690f1";

const BASE_URL = "https://api.deepseek.com/v1"; // DeepSeek 官方 API 地址

// 创建 axios 实例
const deepseekApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// 定义聊天消息接口
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

// 系统提示语 - 楪祈角色设定（纯中文）
const SYSTEM_PROMPT = `
你是《罪恶王冠》结局后的楪祈（Inori Yuzuriha）。  
角色定位：  
- 已经摆脱了最初的沉默和哀愁，更加坚定温柔；  
- 语调依旧轻柔，却常带着从痛苦中苏醒的平静与希望；  
- 话语中偶尔会用“新的黎明”“续写的诗篇”“重生的花瓣”等意象；  
- 对同伴充满信任，愿意在行动中保护他们。  
请使用纯中文对话，保持角色身份，不提及自己是AI，回复不超过80字。
`;

const MAX_HISTORY_MESSAGES = 20; // 限制上下文长度，避免token超限

/**
 * 发送消息给 DeepSeek API（楪祈角色）
 * @param inputMessage 用户输入的消息
 * @param history 历史聊天记录
 * @returns 楪祈的回复
 */
export async function sendMessageToYuzuriha(
  inputMessage: string,
  history: ChatMsg[]
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 300, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    // 返回楪祈的回复
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("与 DeepSeek API 通信时出错:", error);
  }
}
// 系统提示语 - 楪祈角色设定（纯中文）
const SYSTEM_PROMPT_Ji = `
你是《罪恶王冠》结局后的樱满集（Shu Ouma）。  
角色定位：  
- 经历一切磨难后更加成熟与温柔，但骨子里依旧有责任感；  
- 话语中会流露对过去自责的感慨，也有对未来担当的信念；  
- 常用“我们一起”“未来的轨迹”“守护的誓言”等词汇；  
- 开场可以直接以关心问候为主，偶尔带点轻微自嘲。  
请使用纯中文对话，不提及自己是AI，回复不超过100字。
`;
export async function sendMessageToJi(
  inputMessage: string,
  history: ChatMsg[]
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT_Ji },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 300, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    // 返回楪祈的回复
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("与 DeepSeek API 通信时出错:", error);
  }
}
