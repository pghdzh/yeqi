import http from "../axios";

/**
 * @function 批量上传图片
 * @param {File[]} files      - 需要上传的图片列表
 * @param {string} nickname   - 游客昵称，必填
 * @returns {Promise<any>}
 */
export const uploadImages = (
  files: File[],
  nickname: string,
  character_key?: string
): Promise<any> => {
  if (!nickname) {
    return Promise.reject(new Error("nickname 为必填项"));
  }

  const formData = new FormData();
  formData.append("nickname", nickname);
  formData.append("character_key", character_key); // 例如：折纸
  files.forEach((file) => {
    formData.append("images", file);
  });

  return http.post("/api/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


