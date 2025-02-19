// 文件移动：选择数据库文件时需对选择文件进行移动
import { request } from "@/utils";


// 精选基因、表型数据分析、GWAS
// （function字段为：jxjj_code_v2，gwas_code_v2，description_v2）
export function fileMove2(formData){
  return request.post('/fileCopy02',formData)
  .then(response=>response.data)
  .catch(error=>{
    throw error;
  })
}

// 除上三个功能外的文件复制
// （包含train,predict,train-predict,population_division_code,mul_code,optimal_parents）
export function fileMove(formData) {
  return request.post('/fileCopy', formData)
    .then(response => response.data)
    .catch(error => {
      throw error;
    })
}