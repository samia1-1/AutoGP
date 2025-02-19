import { Button, Form, Upload, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { downloadMulPredict, getBoutiqueFileAPI, getPersonalFileAPI, getShareFileAPI, mulitPredictAPI } from '@/apis';
import { downloadPredictRecord, file_filter, file_move } from '@/utils';
import { useTranslation } from 'react-i18next';
import HelpVideo from '@/components/HelpVideo';
const MulitAreaPredict = () => {

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [resData, setResData] = useState(null);
  const [download, setDownload] = useState(false);

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);
  const [selectedModelUploadOption, setSelectedModelUploadOption] = useState(null);


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
          file_move(file.key, localStorage.getItem("username"), "mul_code")
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
          file_move(file.key, "share", "mul_code")
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
          file_move(file.key, "boutique", "mul_code")
        }
      })),
    },
  ];


  const csvItems = [
    {
      key: '1',
      label: t('Upload a local file'),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById('hidden-upload-csv').click();
      },
    },
    {
      key: '2',
      label: t('Upload a personal database file'),
      children: file_filter(personalFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "mul_code")
        },
      })),
    },
    {
      key: '3',
      label: t('Upload a shared database file'),
      children: file_filter(shareFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, "share", "mul_code")
        },
      })),
    },
    {
      key: '4',
      label: t('Upload a high-quality resource file'),
      children: file_filter(boutiqueFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, "boutique", "mul_code")
        },
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
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "mul_code")
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
          // 文件移动
          file_move(file.key, "share", "mul_code")
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
          // 文件移动
          file_move(file.key, "boutique", "mul_code")
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
    action: '/api/uploadFile',
    headers: {
      // 'Content-Type': 'multipart/form-data',
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'mul_code',
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
  const csvProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      // 'Content-Type': 'application/form-data',
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'mul_code',
    },
    onRemove: () => {
      form.setFieldsValue({ csv: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ csv: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedCsvUploadOption(null);
    },
    accept: '.csv',
  };
  const modelProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      // 'Content-Type': 'application/form-data',
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'mul_code',
      // function: 'train-predict',
    },
    onRemove: () => {
      form.setFieldsValue({ model: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ model: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedModelUploadOption(null);
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
    formData.append("csv", formValues.csv);
    formData.append("predict", formValues.model);
    try {
      const res = await mulitPredictAPI(formData);
      console.log(res);
      if (res.code == 200) {
        if (res.fileName1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          if(!res.fileName1.startsWith("Execution")){
          message.success("Success! Please download the results!")
          setResData(res);
          setDownload(true);}
          else{
            message.error("No result. Please check whether the selected file is correct")
          }
        }
      } else {
        message.error(res.msg)
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
      downloadPredictRecord(resData.fileName1,downloadMulPredict)
    } else {
      message.error(t("Download failed, did not get results! Please retrain!"));
    }
  };

  return (
    <div className="mulit">
      <HelpVideo videoPath={'/helpVideo/mul_predict.mp4'}/>
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
          name='csv'
          label={t('Upload environment data to be predicted')}
          className='form-item-layout'
          rules={[
            {
              required: true,
              message: t('Please upload a CSV file!'),
            },
          ]}
        >
          <Dropdown menu={{ items: csvItems }} placement='bottom' arrow>
            <Button>
              <UploadOutlined />
              {'csv ' + t('format')}
            </Button>
          </Dropdown>
          {selectedCsvUploadOption}
          <Upload {...csvProps} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id='hidden-upload-csv'>
              {'csv ' + t('format')}
            </Button>
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
        <Form.Item className='P-func-item'>
          <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Start predicting')}</Button>
        </Form.Item>
        <Form.Item className='P-func-item'>
          <Button onClick={loadFile} disabled={!download}>{t('Download the CSV file')}</Button>
        </Form.Item>
      </Form>

    </div>
  )
}

export default MulitAreaPredict;