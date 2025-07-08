import http from "../axios";

/**
 * @function 获取排行榜（分页）
 * @param {object} params - 例如：{ page: 1, pageSize: 10 }
 */
export const getRankingList = (params: any): any => {
  return http.get("/api/rankings", params);
};
