import http from "../axios";

/**
 * 获取资源列表（分页 + 搜索）
 * @param params { page?: number, pageSize?: number, search?: string, role_key?: string }
 */
export const getResourceList = (params: any) => {
  return http.get("/api/resources", params);
};

/**
 * 新建资源
 * @param data { title: string, uploader?: string, link: string, storage_type?: string, role_key?: string }
 */
export const createResource = (data: any) => {
  return http.post("/api/resources", data);
};

/**
 * 编辑资源
 * @param id 资源 ID
 * @param data { title?: string, uploader?: string, link?: string, storage_type?: string, role_key?: string }
 */
export const updateResource = (id: string | number, data: any) => {
  return http.put(`/api/resources/${id}`, data);
};

/**
 * 删除资源
 * @param id 资源 ID
 */
export const deleteResource = (id: string | number) => {
  return http.delete(`/api/resources/${id}`);
};

/**
 * 点赞资源
 * @param id 资源 ID
 * @param action 'like' | 'unlike' | 'toggle' 默认 toggle
 */
export const likeResource = (
  id: string | number,
  action: "like" | "unlike" | "toggle" = "toggle"
) => {
  return http.post(`/api/resources/${id}/like`, { action });
};
