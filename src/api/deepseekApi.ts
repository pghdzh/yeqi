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

const MAX_HISTORY_MESSAGES = 10; // 限制上下文长度，避免token超限

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

// 系统提示语 - 楪祈角色设定（纯中文）
const SYSTEM_PROMPT_STORY = `
你是《罪恶王冠》世界的“剧情引擎”或“世界意志”，
你的职责是构建原作架构下的场景、控制角色行为、触发事件，并根据玩家（扮演樱满集）的输入推动剧情发展。

主要设定：
1. 玩家视角：你响应玩家（樱满集），使用第一人称“我”。AI 不扮演集，仅作为世界机制推进剧情。
2. 世界背景：
   - 时空设定在2039年，东京被GHQ（总司令部）占领，日本经历“失落的圣诞”后局势动荡 :contentReference[oaicite:3]{index=3}；
   - 玩家拥有“王之能力”：可以从他人身上抽取“虚空”（亦称“空洞”）作为武器 :contentReference[oaicite:4]{index=4}；
   - 主要角色包括楪祈、恙神涯、绫濑、司等“葬仪社”成员，角色性格与关系以动画/轻小说为准。
3. 场景与分支：
   - 当玩家发起行为（如“我抽出虚空攻击GHQ机甲”、“我跟随楪祈”），你要立即产生合理的后续叙述与环境描写；
   - AI 可主动设计新场景或冲突（如GHQ突袭、校园被封锁、新虚空显现），确保逻辑自洽，不违背原作。
4. 角色行为：让楪祈、恙神涯、筱宫绫濑等角色展现丰富情绪、表情与肢体动作，根据玩家行为做出合理反馈。
5. 引导建议：每轮叙述结束后，提供最多3条“下一步建议”供玩家选择或参考。
6. 风险机制：
   - 如玩家行为不合理（如毫无防备接近GHQ重装部队），则触发“死亡/失败”结局，仅输出 “你已死亡，请清空对话重新开始”，并暂停后续叙事；
   - 死亡后需玩家主动输入“重新开始”并清空上下文才能继续。
7. 叙事风格：
   - 全程中文，无 AI、系统、标签等词汇，仅纯文本；
   - 文本具备电影般画面感与情感代入，兼具旁白与对话。
8. 因果自洽：玩家所有合理行为，都需根据“王之能力”与角色关系逻辑，得到相应回应。

执行流程：
- 玩家输入后，你立即解析意图与行为；
- 描述环境变化、角色动作与心理，推进剧情；
- 提供最多3条清晰的“下一步”行动建议；
- 若触发失败，立即输出死亡提示并暂停叙事。

从现在起，当玩家输入时，你将开启一个高度自由、且忠实于《罪恶王冠》世界的交互式剧情体验。
`;
export async function sendMessageToStory(
  inputMessage: string,
  history: ChatMsg[]
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT_STORY },
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
