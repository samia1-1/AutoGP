import { request } from "@/utils";

// 表型提取
function getVideoNameAPI() {
  return request.get('/corn/getAll')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
function prePhenotypeAPI(formData){
  return request.post('/corn',formData)
  .then(response => response.data)
  .catch(error => {
    throw error;
  })
}

// 精选基因提取
function preGeneAPI(formData) {
  return request.post('/jxjj', formData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

function downloadPreGeneAPI(fileName, fileQ) {
  return request.get('/jxjj/download', { params: { fileName, fileQ }})
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

export {
  getVideoNameAPI,prePhenotypeAPI,
  preGeneAPI,downloadPreGeneAPI
}