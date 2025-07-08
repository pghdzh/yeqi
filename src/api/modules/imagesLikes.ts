import http from "../axios";

/**
 * @function 查询图片列表（分页 + 排序 + 筛选）
 * @param {object} options
 * @param {number} options.page           - 当前页，默认 1
 * @param {number} options.limit          - 每页数量，默认 10
 * @param {string} [options.sortBy]       - 排序字段：uploaded_at 或 like_count
 * @param {string} [options.order]        - 排序方式：asc / desc
 * @param {string} [options.character_key] - 可选，角色 key
 * @returns {Promise<any>}
 */
export const getImagesLikesList = (options): Promise<any> => {
  return http.get("/api/getImagesLikes", options);
};

/**
 * @function 点赞接口
 * @param {number} id - 图片 ID
 * @returns {Promise<any>}
 */
export const likeImage = (id: number): Promise<any> => {
  if (!id) return Promise.reject(new Error("ID 不能为空"));
  return http.post(`/api/like/${id}`);
};
