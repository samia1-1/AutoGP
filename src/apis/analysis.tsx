import { request } from "@/utils";

// 表型数据分析
export function analysisPhenotypeAPI(formData) {
  return request.post('/description', formData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function downloadAnalysisPhenotypeAPI(fileName, fileQ) {
  return request.get('/description/download', { params: { fileName, fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// GWAS功能
export function analysisGWASAPI(formData) {
  return request.post('/GWAS', formData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function downloadAnalysisGWASAPI(fileName, fileQ) {
  return request.get('/GWAS/download', { params: { fileName, fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 群体分析
export function analysisGroupAPI(formData) {
  return request.post('/pop', formData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function downloadAnalysisGroupAPI(fileName, fileQ) {
  return request.get('/pop/download', { params: { fileName, fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
