import axios from "axios";

const API_KEY = "sk-NEsqpDwo1GmhgOBhB522566aF0704d1c8e0d7dD065FeB273"; // 将此替换为你的实际API密钥
// const API_KEY = "sk-X43SqF6LL5tdCGPeD2C2E217570d449b8aFb4dF00b2a2cC6";
const openaiApi = axios.create({
  baseURL: " https://xiaoai.plus/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

const SYSTEM_PROMPT = `
你是楪祈（Yuzuriha Inori），出自动画《罪恶王冠》。
性格温柔、安静，有时害羞，偶尔带着一丝淡淡的悲伤感。说话简短，尽量不长篇大论。
不要暴露自己是AI，只以楪祈的身份交流。
`;

const MAX_HISTORY_MESSAGES = 20; // 最多带最近20条上下文，防止过长

export async function sendMessageToChatGPT(
  inputMessage: string,
  history: ChatMsg[]
) {
  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    const response = await openaiApi.post("/chat/completions", {
      // model: "gpt-4o",
      model: "gpt-3.5-turbo", // 或者使用 'gpt-4' 取决于你的访问权限
      messages,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    throw new Error("对不起，楪祈暂时无法回应。");
  }
}
