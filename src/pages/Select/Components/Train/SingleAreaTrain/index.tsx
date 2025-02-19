import { useEffect, useRef, useState } from "react";
import { Button, Form, Upload, Input, Dropdown, Space, Select, message } from 'antd';
import { Progress } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { download1, trainAPI, getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI } from '@/apis';
import { useTranslation } from "react-i18next";
import { file_filter, file_move } from '@/utils/file.tsx';
import HelpVideo from "@/components/HelpVideo";

const SingleAreaTrain = () => {
  const { t } = useTranslation();

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);

  const [form] = Form.useForm();

  const [model, setModel] = useState('XGBOOST');

  const [resData, setResData] = useState(null);

  useEffect(() => {
    async function getPersonalFile() {
      const res = (await getPersonalFileAPI()).data;
      if (res.code === 200) {
        const data = res.data;
        const updatedFiles = data.map(file => ({
          key: file.fileName + "." + file.fileType,
          label: file.fileName + "." + file.fileType,
          icon: <FileTextOutlined />,
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
          icon: <FileTextOutlined />,
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
          icon: <FileTextOutlined />,
        }));
        setShareFiles(updatedFiles);
      }
    }
    getPersonalFile();
    getBoutiqueFile();
    getShareFile();
  }, []);

  const vcfItems = [
    {
      key: '1',
      label: t('Upload a local file'),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById('hidden-upload-vcf').click();
      },
    },
    {
      key: '2',
      label: t('Upload a personal database file'),
      children: file_filter(personalFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "train")
        },
      })),
    },
    {
      key: '3',
      label: t('Upload a shared database file'),
      children: file_filter(shareFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "share", "train")
        },
      })),
    },
    {
      key: '4',
      label: t('Upload a high-quality resource file'),
      children: file_filter(boutiqueFiles,'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "boutique", "train")
        },
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
          file_move(file.key, localStorage.getItem("username"), "train")
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
          file_move(file.key, "share", "train")
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
          file_move(file.key, "boutique", "train")
        },
      })),
    },
  ];
  
  const vcfProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'train',
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
    accept: '.vcf',
  };

  const csvProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'train',
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
  const [uploading, setUploading] = useState(false);
  const [download, setDownload] = useState(false);
  // 进度条
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const onFinish = async values => {
    setUploading(true);

    setProgress(5); // 初始进度 表示数据开始处理
    setShowProgress(true);
    let formData = new FormData();
    message.success(t("Submitted, please wait patiently!"))

    formData.append('vcf', values.vcf);
    formData.append('csv', values.csv);
    formData.append('model', model);
    formData.append('ps', values.ps || '1');

    // 模拟进度开始
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 90) {
          clearInterval(interval);
          return prevProgress;  // 进度达到90%时停止自动增加
        }
        return prevProgress + 5;  // 每次增加10%
      });
    }, 1000); // 每秒更新一次进度
    try {
      const response = await trainAPI(formData);
      const res = response.data;
      // console.log(response);

      console.log(res);
      if (res.code == 200) {
        if (res.msg1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          message.success("Success! Please download the results!")
          setResData(res);
          setDownload(true);
        }
      }  else {
        message.error(res.msg)
      }
    } catch (error) {
      console.error('Training failed:', error);
      message.error(t('Network connection error, please check the network and try again'))
      setProgress(0);
    }
    setUploading(false);
    setShowProgress(false);
  };

  const loadFile = async () => {
    if (download && resData) {
      const fileName = resData.fileName1;
      // let index = fileName.indexOf('_best_model'); // 找到 "_best_model" 的位置
      let index = fileName.indexOf('_R_'); // 找到 "_best_model" 的位置
      let fileQ = fileName.substring(0, index);
      try {
        const response = await download1(fileName, fileQ);
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resData.fileName1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url); // 清理内存中的引用
        link.remove(); // 清理DOM中的元素
        message.success(t('Successfully downloaded file') + `: ${resData.fileName1}`);
      } catch (error) {
        message.error(t('Network connection error, please check the network and try again'))
        throw error;
      }
      if (model === 'DNNGP') {
        const fileName2 = resData.fileName2;
        let index = fileName2.indexOf('_pca'); // 找到 "_best_model" 的位置
        let fileQ = fileName2.substring(0, index);
        try {
          const response = await download1(fileName2, fileQ);
          const blob = new Blob([response.data], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', resData.fileName2);
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url); // 清理内存中的引用
          link.remove(); // 清理DOM中的元素

          message.success(t('Successfully downloaded file') + `: ${resData.fileName2}`);
        } catch (error) {
          message.error(t('Network connection error, please check the network and try again'))
          throw error;
        }
      }
    } else {
      message.error(t("Download failed, did not get results! Please retrain!"))
    }
  };

  const modelChange = value => {
    console.log(`selected ${value}`);
    setModel(value);
  };

  const formRef = useRef(null);
  return (

    <div className="single_area">
      <HelpVideo videoPath={'/helpVideo/train.mp4'}/>
      <Form ref={formRef} form={form} name='normFile' onFinish={onFinish}>
        <Form.Item
          name='vcf'
          label={t('Upload the data of the gene to be trained')}
          className='form-item-layout'
          rules={[
            {
              required: true,
              message: t('Please upload a VCF file!'),
            },
          ]}
        >
          <Dropdown menu={{ items: vcfItems }} placement='bottom' arrow>
            <Button>
              <UploadOutlined />
              {'vcf ' + t('format')}
            </Button>
          </Dropdown>
          {selectedVcfUploadOption}
          <Upload {...vcfProps} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id='hidden-upload-vcf'>
              {'vcf ' + t('format')}
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name='csv'
          label={t('Upload the phenotype data of the order to be trained')}
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
          label={t('Model selection')}
          className='form-item-layout'
        >
          <Space>
            <Select
              defaultValue="XGBOOST"
              style={{ width: 120 }}
              onChange={modelChange}
              options={[
                { value: 'XGBOOST', label: 'XGBOOST' },
                { value: 'GBDT', label: 'GBDT' },
                { value: 'MLP', label: 'MLP' },
                { value: 'SVM', label: 'SVM' },
                { value: 'RandomForest', label: 'RandomForest' },
                { value: 'DNNGP', label: 'DNNGP' },
                { value: 'DLGWAS', label: 'DLGWAS' },
                { value: 'DeepGS', label: 'DeepGS' },
                { value: 'SoyDNGP', label: 'SoyDNGP' },
                { value: 'OHGP', label: 'OHGP' },
              ]}
            />
          </Space>
        </Form.Item>

        <Form.Item label={t('Remarks information')} className='P-func-item' name='ps'>
          <Input placeholder={t('Optional, used to note the task information, pay attention to the input content does not generate spaces!')}></Input>
        </Form.Item>
        {showProgress && <Progress percent={progress} />}
        <Form.Item className='P-func-item'>
          <Button type='primary' htmlType='submit' loading={uploading} disabled={uploading}>
            {t('Start training')}
          </Button>
        </Form.Item>
        <Form.Item className='P-func-item'>
          <Button onClick={loadFile} disabled={!download}>
            {t('Download the model file')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SingleAreaTrain;