import { request } from "@/utils";

// 获取评论
function getCommentAPI() {
  return request.get('/comment/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 发布评论
function publishAPI(commentData) {
  return request.post('/comment/set', commentData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}


export { getCommentAPI, publishAPI }