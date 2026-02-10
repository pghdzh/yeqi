// 更新前端调用
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL+'/api/deepseek';
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
  isEgg?: boolean;
}
export async function sendMessageToHui(
  inputMessage: string,
  history: ChatMsg[],
  character: string = "yeqi",
): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE}/chat`, {
      inputMessage,
      history,
      character,
    });

    if (response.data.error) {
      throw new Error(response.data.message);
    }

    return response.data.data.response;
  } catch (error: any) {
    console.error("API调用错误:", error);
    return "error";
  }
}

// 获取可用角色列表
export async function getAvailableCharacters() {
  const response = await axios.get(`${API_BASE}/characters`);
  return response.data.data;
}
