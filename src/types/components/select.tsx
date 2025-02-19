


// 预测

export interface PredictDataType {
  predictId: number,
  vcf: string,
  model1: string,
  model2: string,
  ps: null | string,
  createTime: string,
  userId: number
}

// 一体化
export interface CombineDataType {
  trainpredictId: number,
  vcf: string,
  csv: string,
  predict: string,
  model: string,
  ps: string,
  createTime: string,
  userId: number
}
