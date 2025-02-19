// 训练
export interface TrainResType {
  code: number;
  msg1: string;
  fileName1: string;
}

// 预测
export interface PredictResType {
  code: number;
  msg1: string;
  fileName1: string;
}
export interface PredictRecordType {
  code: number;
  msg: string;
  data:{
    predictId:number,
    vcf:string,
    model1:string,
    model2:string,
    ps:null|string,
    createTime:string,
    userId:number
  }[]
}

// 一体化
export interface CombineResType {
  code: string;
  msg1: string;
  msg2: string;
  fileName1: string;
  fileName2: string;
}
export interface CombineRecordType {
  code: number;
  msg: string;
  data:{
    trainpredictId:number,
    vcf:string,
    csv:string,
    predict:string,
    model:string,
    ps:string,
    createTime:string,
    userId:number
  }[]
}

// 选择最优亲本
export interface OptimalResType {
  code: string;
  msg1: string;
  fileName1: string;
  matrix1: string;
  matrix2: string;
  matrix3: string;
  matrix4: string;
  matrix5: string;
  matrix6: string;
}
export interface OptimalRecordType {
  code: number;
  msg: string;
  data:{
    optimalparentsId:number,
    vcf:string,
    txt:string,
    model:string,
    model_pca:string,
    valuenum:string,
    createTime:string,
    userId:number
  }[]
}