import { request } from "@/utils";

export function getAllPage(page) {
  return request.get('/corn/getAllPage', { params: { page }})
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}

export function getprovincePage(area,page) {
  return request.get('/cornSQLAll/getAll', { params: { area,page }})
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}


export function getPicture(filePath) {
  return request.get('/corn/download', {
    params: { filePath },
    responseType: 'blob',  // 设置返回类型为二进制 Blob
  })
    .then(response => response.data)  // 返回 Blob 数据
    .catch(error => {
      throw error;
    });
}
