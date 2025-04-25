import http from "../axios";

/**
 * @function 获取留言列表（分页）
 * @param {object} params - 例如：{ page: 1, pageSize: 10 }
 */
export const getMessageList = (params: any): any => {
  return http.get("/api/YeQiMessage", params);
};

/**
 * @function 获取单条留言详情
 * @param {number} id - 留言ID
 */
export const getMessageById = (id: number): any => {
  return http.get(`/api/YeQiMessage/${id}`);
};

/**
 * @function 创建留言
 * @param {object} data - 例如：{ name: "张三", content: "这是一条留言" }
 */
export const createMessage = (data: any): any => {
  return http.post("/api/YeQiMessage", data);
};

/**
 * @function 更新留言内容
 * @param {number} id - 留言ID
 * @param {object} data - 例如：{ content: "修改后的留言内容" }
 */
export const updateMessage = (id: number, data: any): any => {
  return http.put(`/api/YeQiMessage/${id}`, data);
};

/**
 * @function 删除留言
 * @param {number} id - 留言ID
 */
export const deleteMessage = (id: number): any => {
  return http.delete(`/api/YeQiMessage/${id}`);
};
