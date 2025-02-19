import { useEffect, useState } from 'react';
import { Form, Upload, Button, message,Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { uploadBoutiqueFileAPI } from '@/apis';


const RecordForm = ({ record,setRecords, records }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    form.setFieldsValue(record);
  }, [record, form]);

  const [file, setFile] = useState<File | null>(null); // 保存文件列表

  const uploadProps = {
    onRemove: () => {
      setFile(null);
    },
    beforeUpload: file => {
      setFile(file); // 保存文件但不上传
      return false; // 阻止文件自动上传
    },
    file,
  };
  // 上传文件
  const handleManualUpload = async (values) => {
    if (!file) {
      message.error('请先选择一个文件！');
      return;
    }
    console.log(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append("note",values.ps||"1")

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    try {
      const res = (await uploadBoutiqueFileAPI(formData)).data;
      console.log('Upload successful:', res);
      if (res.code === 200) {
        message.success('文件上传成功！');
        setRecords([...records, {
          fileName: file.name.split(".")[0],
          fileType: file.name.split(".")[1],
          fileStatus: 1,
          createTime: new Date().toISOString(),
          nickName: localStorage.getItem('username'),
          note: '',
          userId: 0,
          userName: localStorage.getItem('username'),
        }]);
      }else{
        message.error(res.msg)
      }
      // 可以在这里更新记录列表
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('文件上传失败,请检查网络或刷新重试!');
    }
  };

  return (
    <div>
      <Form form={form} layout="inline">
        <Form.Item name="description" label={t("上传文件")}>
          <Upload {...uploadProps} accept="">
            <Button icon={<UploadOutlined />} style={{ fontSize: '1.6vh', width: '10vw' }}></Button>
          </Upload>
        </Form.Item>
        <Form.Item label={t("备注信息")} name="ps">
          <Input></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={handleManualUpload}>
            {t('上传')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RecordForm;
