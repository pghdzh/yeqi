import http from "../axios";
const CHARACTER_KEY = 'yeqi'; // 当前角色标识，可根据路由或上下文动态获取
/**
 * @function 获取留言列表（分页）
 * @param {object} params - 例如：{ page: 1, pageSize: 10 }
 */
export const getMessageList = (params: any): any => {
  return http.get("/api/YeQiMessage", {
    ...params,
    character_key: CHARACTER_KEY,
  });
};

/**
 * @function 创建留言
 * @param {object} data - 例如：{ name: "张三", content: "这是一条留言" }
 */
export const createMessage = (data: any): any => {
  return http.post("/api/YeQiMessage", {
    character_key: CHARACTER_KEY,
    ...data,
  });
};
