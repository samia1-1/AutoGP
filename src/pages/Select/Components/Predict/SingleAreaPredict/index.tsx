import { Button, Form, Upload, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { download2, getBoutiqueFileAPI, getPersonalFileAPI, getShareFileAPI, predictAPI } from '@/apis';
import { downloadPredictRecord, file_filter, file_move } from '@/utils';
import { useTranslation } from 'react-i18next';
import HelpVideo from '@/components/HelpVideo';
const SingleAreaPredict = () => {
  
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [resData, setResData] = useState(null);
  const [download, setDownload] = useState(false);
  // const [viewCsv, setViewCsv] = useState(false);

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedModelUploadOption, setSelectedModelUploadOption] = useState(null);

  const [isDnngpModel, setIsDnngpModel] = useState(false);

  const vcfItems: MenuProps['items'] = [
    {
      key: '1',
      label: t("Upload a local file"),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById("hidden-upload-vcf").click();
      }
    },
    {
      key: '2',
      label: t("Upload a personal database file"),
      children: file_filter(personalFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "predict")
        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "share", "predict")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "boutique", "predict")
        }
      })),
    },
  ];

  const modelItem: MenuProps['items'] = [
    {
      key: '1',
      label: t("Upload a local file"),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById("hidden-upload-model").click();
      }
    },
    {
      key: '2',
      label: t("Upload a personal database file"),
      children: file_filter(personalFiles,'zip').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedModelUploadOption(file.key);
          form.setFieldsValue({ model: file.key });
          setIsDnngpModel(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "predict")
        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles,'zip').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedModelUploadOption(file.key);
          form.setFieldsValue({ model: file.key });
          setIsDnngpModel(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, "share", "predict")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles,'zip').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedModelUploadOption(file.key);
          form.setFieldsValue({ model: file.key });
          setIsDnngpModel(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, "boutique", "predict")
        }
      })),
    },
  ];

  
  useEffect(() => {
    async function getPersonalFile() {
      const res = (await getPersonalFileAPI()).data;
      if (res.code === 200) {
        const data = res.data;
        const updatedFiles = data.map(file => ({
          key: file.fileName + "." + file.fileType,
          label: file.fileName + "." + file.fileType,
          icon: <FileTextOutlined />
        }));
        setPersonalFiles(updatedFiles);
      }
    }
    async function getBoutiqueFile() {
      const res = (await getBoutiqueFileAPI()).data;
      if (res.code === 200) {
        const data = res.data;
        const updatedFiles = data.map(file => ({
          key: file.fileName + "." + file.fileType,
          label: file.fileName + "." + file.fileType,
          icon: <FileTextOutlined />
        }));
        setBoutiqueFiles(updatedFiles);
      }
    }
    async function getShareFile() {
      const res = (await getShareFileAPI()).data;
      if (res.code === 200) {
        const data = res.data;
        const updatedFiles = data.map(file => ({
          key: file.fileName + "." + file.fileType,
          label: file.fileName + "." + file.fileType,
          icon: <FileTextOutlined />
        }));
        setShareFiles(updatedFiles);
      }
    }
    getPersonalFile();
    getBoutiqueFile();
    getShareFile();
  }, []);

  const vcfProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'predict',
    },
    onRemove: () => {
      form.setFieldsValue({ vcf: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ vcf: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedVcfUploadOption(null);
    },
    accept: ".vcf"
  };

  const modelProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      // 'Content-Type': 'application/form-data',
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'predict',
    },
    onRemove: () => {
      form.setFieldsValue({ model: null });
      setIsDnngpModel(false);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ model: info.file.name });
        setIsDnngpModel(info.file.name.includes('DNNGP'));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedModelUploadOption(null);
    },
    accept: ".zip"
  };

  const dnngpProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      'Content-Type': 'multipart/form-data',
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'predict',
    },
    onRemove: () => {
      form.setFieldsValue({ dnngp: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ dnngp: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    accept: ".zip"
  };

  const [uploading, setUploading] = useState(false);

  const onFinish = async () => {
    setUploading(true);
    let formData = new FormData();
    message.success(t("Submitted, please wait patiently!"))
    const formValues = form.getFieldsValue();
    formData.append("vcf", formValues.vcf);
    formData.append("model1", formValues.model);
    formData.append("model2", formValues.dnngp || "1");
    try {
      const response = await predictAPI(formData);
      const res = response.data;
      console.log(res);
      if (res.code == 200) {
        if (res.fileName1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          message.success("Success! Please download the results!")
          setResData(res);
          setDownload(true);
        }
      } else {
        message.error(res.msg1)
      }
    } catch (error) {
      console.error('Training failed:', error);
      message.error(t("Network connection error, please check the network and try again"))
      setUploading(false);
    }
    setUploading(false);
  };

  const loadFile = async () => {
    if (download && resData) {
      downloadPredictRecord(resData.fileName1,download2)
    } else {
      message.error(t("Download failed, did not get results! Please retrain!"));
    }
  };
  
  return (
    <div className="single">
      <HelpVideo videoPath={'/helpVideo/predict.mp4'}/>
      <Form ref={formRef} form={form} onFinish={onFinish}>
        <Form.Item
          name="vcf"
          label={t("Upload the data of the genotype to be predicted")}
          className="form-item-layout"
          rules={[
            {
              required: true,
              message: t('Please upload a VCF file!'),
            },
          ]}
        >
          <Dropdown menu={{ items: vcfItems }} placement="bottom" arrow>
            <Button><UploadOutlined />{"vcf " + t("format")}</Button>
          </Dropdown>
          {selectedVcfUploadOption}
          <Upload {...vcfProps} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id="hidden-upload-vcf">{"vcf " + t("format")}</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="model"
          label={t("Upload model weights")}
          className="form-item-layout"
          rules={[
            {
              required: true,
              message: t('Please select a model'),
            },
          ]}
        >
          <Dropdown menu={{ items: modelItem }} placement="bottom" arrow>
            <Button><UploadOutlined />{"zip " + t("format")}</Button>
          </Dropdown>
          {selectedModelUploadOption}
          <Upload {...modelProps} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id="hidden-upload-model">{"zip " + t("format")}</Button>
          </Upload>
        </Form.Item>
        {isDnngpModel && (
          <Form.Item name="dnngp" label={t("Whether it is a DNNGP model")} className="form-item-layout">
            <Upload {...dnngpProps}>
              <Button icon={<UploadOutlined />} style={{ fontSize: '1.6vh', width: '10vw' }}></Button>
            </Upload>
          </Form.Item>
        )}
        <Form.Item className='P-func-item'>
          <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Start predicting')}</Button>
        </Form.Item>
        <Form.Item className='P-func-item'>
          <Button onClick={loadFile} disabled={!download}>{t('Download the CSV file')}</Button>
          {/* <Button onClick={view} disabled={!viewCsv}>{t('在线查看分析结果')}</Button> */}
        </Form.Item>
      </Form>

    </div>
  )
}

export default SingleAreaPredict;