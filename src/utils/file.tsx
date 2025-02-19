import { fileMove,fileMove2 } from "@/apis";
import { message } from "antd";


// 基因选择组选择数据库文件时 文件移动
async function file_move(key,module1,function1) {
  let formData = new FormData();
  formData.append("file", key);
  formData.append("module", module1);
  formData.append("function", function1);
  const res = await fileMove(formData)
  if (res.code != 200) {
    message.error("File selection failed. Please upload the local file or try again later")
  }
}

// 表型数据分析、GWAS、精选基因功能选择数据库文件时 文件移动
async function file_move2(key,module1,function1) {
  let formData = new FormData();
  formData.append("file", key);
  formData.append("module", module1);
  formData.append("function", function1);
  const res = await fileMove2(formData)
  if (res.code != 200) {
    message.error("File selection failed. Please upload the local file or try again later")
  }
}


// 根据type对文件进行过滤
export function file_filter(data,type){
  return data.filter((file)=>file.label.endsWith(type));
}

export { file_move,file_move2 }