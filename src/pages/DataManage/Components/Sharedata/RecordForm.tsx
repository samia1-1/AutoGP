import { useEffect, useState } from 'react';
import { Form, Upload, Button, message, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // 引入axios用于手动上传

const RecordForm = ({ record, setRecords, records }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    form.setFieldsValue(record);
  }, [record, form]);

  const [fileList, setFileList] = useState([]); // 保存文件列表
  const [uploading, setUploading] = useState(false); // 用于跟踪上传状态

  const uploadProps = {
    name: 'file',
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      setFileList(fileList.filter(f => f.uid !== file.uid)); // 移除文件时更新文件列表
    },
    beforeUpload: () => {
      return false; // 阻止自动上传
    },
  };

  // 手动上传文件的逻辑
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error(t('请选择文件'));
      return;
    }

    setUploading(true); // 设置为上传中状态

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file.originFileObj); // 读取原始文件
    });

    formData.append('note', form.getFieldValue('ps') || '1'); // 添加备注信息

    try {
      const response = await axios.post('http://218.199.69.63:39600/share/upload', formData, {
        headers: {
          token: `${localStorage.getItem('token_key')}`, // 从 localStorage 获取 token
        },
      });

      if (response.status === 200) {
        message.success(t('File uploaded successfully'));

        const uploadedFile = fileList[0]; // 假设一次只上传一个文件
        setRecords([
          ...records,
          {
            fileName: uploadedFile.name.split(".")[0],
            fileType: uploadedFile.name.split(".")[1],
            fileStatus: 1,
            createTime: new Date().toISOString(),
            nickName: localStorage.getItem('username'),
            note: form.getFieldValue('ps') || '',
            userId: 0,
            userName: localStorage.getItem('username'),
          },
        ]);
        setFileList([]); // 清空文件列表
      } else {
        message.error(t('File upload failure'));
      }
    } catch (error) {
      message.error(t('Network connection error, please check the network and try again'));
    } finally {
      setUploading(false); // 上传完成，重置上传状态
    }
  };

  return (
    <div>
      <Form form={form} layout="inline">
        <Form.Item name="description" label={t("Upload file")}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} style={{ fontSize: '1.6vh', width: '10vw' }} disabled={uploading}>
              {t('Select file')}
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item label={t("Remarks information")} name="ps">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? t('Uploading...') : t('Upload')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RecordForm;
