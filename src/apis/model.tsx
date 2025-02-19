import { request } from "@/utils";
import {
  PredictResType,PredictRecordType,
  CombineResType,CombineRecordType,
  OptimalRecordType,
} from "@/types";

// 训练
function trainAPI(trainData) {
  return request.post('/train01', trainData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function mulitTrainAPI(trainData) {
  return request.post('/mulTrain', trainData)
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
function download1(fileName, fileQ) {
  return request.get('/train/download', { params: { fileName, fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function downloadMulTrainCombine(fileName, fileQ) {
  return request.get('/mul/download', { params: { fileName, fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
function getTrainRecord() {
  return request.get('/train/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function getMulitTrainRecord() {
  return request.get('/mulTrain/get')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}



// 预测
function predictAPI(predictData) {
  return request.post<PredictResType>('/predict01', predictData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function mulitPredictAPI(trainData) {
  return request.post('/mulPredict', trainData)
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
function download2(fileName) {
  return request.get('/predict/download', { params: { fileName }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function downloadMulPredict(fileName) {
  return request.get('/mulPredict/download', { params: { fileName }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
function getPredictRecord() {
  return request.get<PredictRecordType>('/predict/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function getMulitPredictRecord() {
  return request.get('/mulPredict/get')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}

function combineAPI(combineData) {
  return request.post<CombineResType>('/trainPredict01', combineData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function mulitCombineAPI(data) {
  return request.post('/mulTrainPredict', data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
function download3(fileName, fileQ) {
  return request.get('/trainPredict/download', { params: { fileQ, fileName }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
function getCombineRecord() {
  return request.get<CombineRecordType>('/trainPredict/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function getMulitCombineRecord() {
  return request.get<CombineRecordType>('/mulTrainPredict/get')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
// 选择最优
function optimalAPI(optimalData) {
  return request.post('/optimalParents01', optimalData)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
function download4(fileName) {
  return request.get('/optimalParents/download', { params: { fileName }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
function getOptimalRecord() {
  return request.get<OptimalRecordType>('/optimalParents/get')
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

// 选择 && 最优
export function trainOptimalAPI(data) {
  return request.post('/trainSelection', data)
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}
export function download5(fileName,fileQ) {
  return request.get('/trainSelection/download', { params: { fileName,fileQ }, responseType: 'arraybuffer' })
    .then(response => response)
    .catch(error => {
      throw error;
    })
}
export function getTrainOptimalRecord() {
  return request.get('/trainSelection/get')
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}

export function fileUpload(file) {
  return request.post('/uploadFile', file)
    .then(response => response)
    .catch(error => {
      throw error;
    })
}

export {
  trainAPI, predictAPI, combineAPI, optimalAPI,
  download1, download2, download3, download4,
  getTrainRecord, getPredictRecord, getCombineRecord, getOptimalRecord,
}