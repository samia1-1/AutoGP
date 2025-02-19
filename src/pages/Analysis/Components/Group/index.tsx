import { useEffect, useRef, useState } from "react";
import { Button, Form, Upload, Input, Dropdown, message } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import './index.scss'
import { getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI, downloadAnalysisGroupAPI, analysisGroupAPI } from '@/apis';
import { useTranslation } from "react-i18next";
import { file_move } from "@/utils";

const AnalGroup = () => {
  const { t } = useTranslation();
  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);

  const formRef = useRef(null);
  const [form] = Form.useForm();

  const [resData, setResData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [download, setDownload] = useState(false);

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
      children: personalFiles.map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "population_division_code")
        },
      })),
    },
    {
      key: '3',
      label: t('Upload a shared database file'),
      children: shareFiles.map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "share", "population_division_code")
        },
      })),
    },
    {
      key: '4',
      label: t('Upload a high-quality resource file'),
      children: boutiqueFiles.map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move(file.key, "boutique", "population_division_code")
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
      function: 'population_division_code',
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

  const onFinish = async values => {
    setUploading(true);
    let formData = new FormData();
    message.success(t("Submitted, please wait patiently!"))

    formData.append('vcf', values.vcf);
    // formData.append('vcf', 'population_division_example.vcf');
    formData.append('valuenum', values.ps || '1');
    try {
      const response = await analysisGroupAPI(formData);
      const res = response.data;
      // console.log(response);

      console.log(res);
      if (res.code == 200) {
        if (res.fileName1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          message.success(t('Success! Please download the results!'))
          setResData(res);
          setDownload(true);
        }
      } else {
        message.error(res.msg)
      }
    } catch (error) {
      console.error('Training failed:', error);
      message.error(t('Network connection error, please check the network and try again'))
    }
    setUploading(false);
  };

  const downloadFile = async (fileName) => {
    let arr = fileName.split('/')
    fileName = arr[arr.length-1]
    console.log(fileName);
    
    let index = fileName.indexOf('.'); // 找到文件名中的某个标识位置
    let fileQ = fileName.substring(0, index);

    try {
      const response = await downloadAnalysisGroupAPI(fileName, fileQ);
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url); // 清理内存中的引用
      link.remove(); // 从DOM中移除
      message.success(t('Successfully downloaded file') + `: ${fileName}`);
    } catch (error) {
      message.error(t('Network connection error, please check the network and try again'));
      throw error;
    }
  };

  const loadFile = async () => {
    if (download && resData) {
      // 检查是否有 fileName1, fileName2, fileName3
      const fileNames = [resData.fileName1, resData.fileName2, resData.fileName3];

      // 遍历 fileNames，逐个下载文件
      for (let fileName of fileNames) {
        if (fileName) { // 确保文件名存在
          await downloadFile(fileName); // 下载文件
        }
      }
    } else {
      message.error(t("Download failed, did not get results! Please retrain!"));
    }
  };
  return (
    <div className="anal_group">
      <div className="title">{t("Population division")}</div>
      <div className="func">

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
          <Form.Item label={t('Please enter the desired population number')} className='P-func-item' name='ps'>
            <Input placeholder={t('It needs to be an integer greater than 1')}></Input>
          </Form.Item>
          <Form.Item className='P-func-item'>
            <Button type='primary' htmlType='submit' loading={uploading} disabled={uploading}>
              {t('Submit')}
            </Button>
          </Form.Item>
          <Form.Item className='P-func-item'>
            <Button onClick={loadFile} disabled={!download}>
              {t('Download the model file')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default AnalGroup