import { useEffect, useRef, useState } from "react";
import { Button, Form, Upload, Input, Dropdown, message } from 'antd';
import { file_filter, file_move } from '@/utils/file.tsx';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI, mulitTrainAPI, downloadMulTrainCombine } from '@/apis';
import { useTranslation } from "react-i18next";
import HelpVideo from "@/components/HelpVideo";

const MulitAreaTrain = () => {
  const { t } = useTranslation();

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);
  const [selectedCsv2UploadOption, setSelectedCsv2UploadOption] = useState(null);

  const [form] = Form.useForm();

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
          file_move(file.key, localStorage.getItem("username"), "mul_code")
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
          file_move(file.key, "share", "mul_code")
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
          file_move(file.key, "boutique", "mul_code")
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
  const csv2Items = [
    {
      key: '1',
      label: t('Upload a local file'),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById('hidden-upload-csv2').click();
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
          setSelectedCsv2UploadOption(file.key);
          form.setFieldsValue({ csv2: file.key });
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
          setSelectedCsv2UploadOption(file.key);
          form.setFieldsValue({ csv2: file.key });
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
          setSelectedCsv2UploadOption(file.key);
          form.setFieldsValue({ csv2: file.key });
          // 文件移动
          file_move(file.key, "boutique", "mul_code")
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
    accept: '.vcf',
  };

  const csvProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
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
  const csv2Props = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'mul_code',
    },
    onRemove: () => {
      form.setFieldsValue({ csv2: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ csv2: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedCsv2UploadOption(null);
    },
    accept: '.csv',
  };

  const [uploading, setUploading] = useState(false);
  const [download, setDownload] = useState(false);


  const onFinish = async values => {
    setUploading(true);
    let formData = new FormData();
    message.success(t("Submitted, please wait patiently!"))

    formData.append('vcf', values.vcf);
    formData.append('csv', values.csv);
    formData.append('predict', values.csv2);
    formData.append('ps', values.ps || '1');
    // formData.append('vcf', 'mul_x_data.vcf');
    // formData.append('csv', 'mul_e_data.csv');
    // formData.append('predict', 'mul_y_data.csv');
    // formData.append('ps', values.ps || '1');

    try {
      const res = await mulitTrainAPI(formData);
      // console.log(response);

      console.log(res);
      if (res.code == 200) {
        if (res.fileName1 === undefined) {
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
    }
    setUploading(false);
  };

  const loadFile = async () => {
    if (download && resData) {
      const fileName = resData.fileName1;
      let index = fileName.indexOf('_R_'); // 找到 "_R_" 的位置
      let fileQ = fileName.substring(0, index);
      try {
        const response = await downloadMulTrainCombine(fileName, fileQ);
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
    } else {
      message.error(t("Download failed, did not get results! Please retrain!"))
    }
  };


  const formRef = useRef(null);
  return (

    <div className="single_area">
      <HelpVideo videoPath={'/helpVideo/mul_train.mp4'}/>
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
          label={t('Upload environment data to be trained')}
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
          name='csv2'
          label={t('Upload phenotype data of each environment to be trained')}
          className='form-item-layout'
          rules={[
            {
              required: true,
              message: t('Please upload a CSV file!'),
            },
          ]}
        >
          <Dropdown menu={{ items: csv2Items }} placement='bottom' arrow>
            <Button>
              <UploadOutlined />
              {'csv ' + t('format')}
            </Button>
          </Dropdown>
          {selectedCsv2UploadOption}
          <Upload {...csv2Props} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id='hidden-upload-csv2'>
              {'csv ' + t('format')}
            </Button>
          </Upload>
        </Form.Item>
        

        <Form.Item label={t('Remarks information')} className='P-func-item' name='ps'>
          <Input placeholder={t('Optional, used to note the task information, pay attention to the input content does not generate spaces!')}></Input>
        </Form.Item>
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

export default MulitAreaTrain;