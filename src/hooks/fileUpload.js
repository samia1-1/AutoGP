import { message } from "antd";

export const useFileUpload = (fileType, form,fileFunction,setFileSelect) => {
  const props = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: fileFunction },
    onRemove: () => {
      setFileSelect('')
      form.setFieldsValue({ [fileType]: null });
    },
    onChange(info) {
      console.log(info)
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        form.setFieldsValue({ [fileType]: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      setFileSelect(info.file.name)
    },
    accept:'.'+fileType
  };
  return props;
};
