import http from "../axios";

/**
 * 获取词条列表（分页 + 搜索）
 * @param params { page?: number, pageSize?: number, search?: string }
 */
export const getWikiList = (params: any) => {
  return http.get("/api/wiki", params);
};


/**
 * 新建词条
 * @param data { title: string, slug?: string, author?: string, content: string }
 */
export const createWiki = (data: any) => {
  return http.post("/api/wiki", data);
};

/**
 * 编辑词条
 * @param id 词条 ID
 * @param data { title?: string, slug?: string, author?: string, content?: string }
 */
export const updateWiki = (id: string | number, data: any) => {
  return http.put(`/api/wiki/${id}`, data);
};

/**
 * 删除词条
 * @param id 词条 ID
 */
export const deleteWiki = (id: string | number) => {
  return http.delete(`/api/wiki/${id}`);
};

/**
 * 点赞词条
 * @param id 词条 ID
 * @param action 'like' | 'unlike' | 'toggle' 默认 toggle
 */
export const likeWiki = (id: string | number, action: "like" | "unlike" | "toggle" = "toggle") => {
  return http.post(`/api/wiki/${id}/like`, { action });
};
