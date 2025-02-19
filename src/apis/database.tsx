import { request } from "@/utils";

// 获取个人文件
function getPersonalFileAPI() {
  return request.get('/getFile')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 获取精品文件 
function getBoutiqueFileAPI() {
  return request.get('/boutique/getFile')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 获取共享文件
function getShareFileAPI() {
  return request.get('/share/getFile')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 获取表型专属数据库数据
function getPhenotypeDataAPI() {
  return request.get('/corn/getAll')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
function getVideoOrObjAPI(filePath) {
  return request.get('/corn/download', { params: { filePath } })
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}

// 删除个人文件
function deletePersonalFileAPI(fileName) {
  return request.get('/delete', { params: { fileName } })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 删除精品文件
function deleteBoutiqueFileAPI(fileName) {
  return request.get('/boutique/delete', { params: { fileName } })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 删除共享文件
function deleteShareFileAPI(fileName, userName) {
  return request.get('/share/delete', { params: { fileName, userName } })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 上传个人文件
function uploadPersonalFileAPI(fileData) {
  return request.post('/upload', fileData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 上传共享文件
function uploadShareFileAPI(fileData) {
  return request.post('/share/upload', fileData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 上传优质资源文件
function uploadBoutiqueFileAPI(fileData) {
  return request.post('/boutique/upload', fileData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}


// 下载个人文件
function downloadPersonalFileAPI(fileName) {
  console.log(fileName);
  return request.get('/download', {
    params: { fileName },
    responseType: 'blob' // 设置为二进制流
  })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 下载精品文件
function downloadBoutiqueFileAPI(fileName) {
  return request.get('/boutique/download', {
    params: { fileName },
    responseType: 'blob' // 设置为二进制流
  })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
// 下载共享文件
function downloadShareFileAPI(fileName) {
  return request.get('/share/download', {
    params: { fileName },
    responseType: 'blob' // 设置为二进制流
  })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}



export {
  getPersonalFileAPI,
  getBoutiqueFileAPI,
  getShareFileAPI,
  getPhenotypeDataAPI, getVideoOrObjAPI,

  deletePersonalFileAPI,
  deleteBoutiqueFileAPI,
  deleteShareFileAPI,

  uploadPersonalFileAPI,
  uploadShareFileAPI,
  uploadBoutiqueFileAPI,

  downloadPersonalFileAPI,
  downloadBoutiqueFileAPI,
  downloadShareFileAPI,
}