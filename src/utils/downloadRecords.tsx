import { download1 } from "@/apis";
import { message } from "antd";

export const downloadSingleTrainRecord = async (path) => {
  const fileName = path;
  // let index = fileName.indexOf('_best_model'); // 找到 "_best_model" 的位置
  let index = fileName.indexOf('_R_'); // 找到 "_best_model" 的位置
  let fileQ = fileName.substring(0, index);
  try {
    const response = await download1(fileName, fileQ);
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', path);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
    message.success("Successfully downloaded file" + `: ${path}`);
  } catch (error) {
    message.error("Network connection error, please check the network and try again");
    throw error;
  }
};
export const downloadTrainRecord = async (path, downloadMethod) => {
  const fileName = path;
  // let index = fileName.indexOf('_best_model'); // 找到 "_best_model" 的位置
  let index = fileName.indexOf('_R_'); // 找到 "_best_model" 的位置
  let fileQ = fileName.substring(0, index);
  try {
    const response = await downloadMethod(fileName, fileQ);
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', path);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
    message.success("Successfully downloaded file" + `: ${path}`);
  } catch (error) {
    message.error("Network connection error, please check the network and try again");
    throw error;
  }
}

export const downloadPredictRecord = async (path, downloadMethod) => {
  try {
    const response = await downloadMethod(path);
    const blob = new Blob([response.data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', path);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
    message.success(`Successfully downloaded file: ${path}`);
  } catch (error) {
    message.error("Network connection error, please check the network and try again");
    throw error;
  }
};


export const downloadCombineRecord = async (path, downloadMethod) => {
  console.log(path)
  let temp = [path]
  if (path.includes('/')) {
    temp = path.split('/')
  }
  const fileName = temp[0];
  console.log(fileName)
  // const fileQ = fileName.split("_best_model")[0];
  const fileQ = fileName.split("_R_")[0];
  try {
    const response = await downloadMethod(fileName, fileQ);
    console.log(111, response);

    const blob = new Blob([response.data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();

    message.success("Successfully downloaded file" + `: ${fileName}`);
  } catch (error) {
    throw error;
  }
  if (temp[1]) {
    // 下载csv
    let fileName3 = temp[1]
    // const fileQ = fileName3.split("_best_model")[0];
    const fileQ_csv = fileName3.split("_R_")[0];
    try {
      const response = await downloadMethod(fileName3, fileQ_csv);
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName3);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();

      message.success("Successfully downloaded file" + `: ${fileName3}`);
    } catch (error) {
      throw error;
    }
  }
}

export const downloadOptimalRecord = async (path, downloadMethod) => {
  downloadPredictRecord(path, downloadMethod)
}
export const downloadFiveRecord = async (path,downloadMethod)=>{
  downloadTrainRecord(path,downloadMethod)
}