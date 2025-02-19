import { Button, Form, Upload, message, Dropdown } from 'antd'
import { useEffect, useRef, useState } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import JSZip from 'jszip';
import { useTranslation } from 'react-i18next';
import { analysisGWASAPI, downloadAnalysisGWASAPI, getBoutiqueFileAPI, getPersonalFileAPI, getShareFileAPI } from '@/apis';
import './index.scss'
import { file_move2, tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';

const AnalGWAS = () => {

  const pathname = useLocation().pathname;
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const { t } = useTranslation();

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);

  const [vcfFile, setVcfFile] = useState<string | undefined>();
  const [csvFile, setCsvFile] = useState<string | undefined>();
  const [download, setDownload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [resData, setResData] = useState(null);    // 下载结果使用
  const [resArr, setresArr] = useState([]);    // 将结果渲染在界面中
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
      } else if (res.code == 401) {
        tokenLoss(pathname);
      } else {
        message.error(res.msg)
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
          setVcfFile(file.key);
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "gwas_code_v2")
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
          setVcfFile(file.key);
          // 文件移动
          file_move2(file.key, "share", "gwas_code_v2")
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
          setVcfFile(file.key);
          // 文件移动
          file_move2(file.key, "boutique", "gwas_code_v2")
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
      children: personalFiles.map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          setCsvFile(file.key);
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "gwas_code_v2")
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
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          setCsvFile(file.key);
          // 文件移动
          file_move2(file.key, "share", "gwas_code_v2")
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
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          setCsvFile(file.key);
          // 文件移动
          file_move2(file.key, "boutique", "gwas_code_v2")
        },
      })),
    },
  ];
  const vcfProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFileNew',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'gwas_code_v2',
    },
    onRemove: () => {
      setVcfFile(null);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          message.success(`${info.file.name} file uploaded successfully`);
          setVcfFile(info.file.name);
          form.setFieldsValue({ vcf: info.file.name });
        } else if (info.file.response.code == 401) {
          message.error("User authentication failed, please log in again!")
        } else {
          message.error(info.file.response.msg)
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const csvProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFileNew',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'gwas_code_v2',
    },
    onRemove: () => {
      setCsvFile(null)
    },
    onChange(info) {
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          message.success(`${info.file.name} file uploaded successfully`);
          setCsvFile(info.file.name);
          form.setFieldsValue({ csv: info.file.name });
        } else if (info.file.response.code == 401) {
          message.error("User authentication failed, please log in again!")
        } else {
          message.error(info.file.response.msg)
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
  };

  const onFinish = async () => {

    setUploading(true)
    let formData = new FormData();
    message.success(t("Submitted, please wait patiently!"))

    if (vcfFile && csvFile) {
      formData.append("vcf", vcfFile);
      formData.append("csv", csvFile);
      // formData.append("vcf", "gwas_example_x.vcf");
      // formData.append("csv", "gwas_example_y.csv");
    }

    try {
      const response = await analysisGWASAPI(formData)
      const res = response.data
      console.log(res)
      if (res.code == 200) {
        if (res.fileName1) {
          setResData(res.fileName1);
          setUploading(false);
          setDownload(true);

          // 调用下载接口，获取ZIP文件
          const fullFileName = res.fileName1.split('/').pop(); // 获取文件名
          const fileQ = fullFileName.split('.').shift(); // 去掉扩展名
          const response = await downloadAnalysisGWASAPI(fullFileName, fileQ);
          console.log(response);
          // 使用 arraybuffer 并手动创建 Blob
          const blob = new Blob([response.data], { type: 'application/zip' });
          // 使用 JSZip 解析 ZIP 文件
          const zip = await JSZip.loadAsync(blob);
          const newImgArr = [];
          // 遍历 ZIP 文件中的每个文件并处理
          zip.forEach(async (_, file) => {
            if (!file.dir) {
              const base64Data = await file.async('base64');
              newImgArr.push(`data:image/jpeg;base64,${base64Data}`);
              // 更新 imgArr 状态
              setresArr([...newImgArr]);
            }
          });
        }
      } else if (res.code == 401) {
        message.error("User authentication failed, please log in again!")
      } else if (res.code == 500) {
        message.error("Training failed, please check the data and try again!")
        setUploading(false)
      }
      else {
        message.error(res.msg)
      }
    } catch (error) {
      console.error('Training failed:', error);
      message.error('Training failed, please check the data and network and try again!')
      setUploading(false);
    }
  }


  const loadFile = async () => {
    if (download && resData) {

      const part = resData.split('/');
      const fullFileName = part[part.length - 1];

      const lastDotIndex = fullFileName.lastIndexOf('.');
      const fileQ = fullFileName.substring(0, lastDotIndex);
      try {
        const response = await downloadAnalysisGWASAPI(fullFileName, fileQ);
        console.log(response);

        // 使用 arraybuffer 并手动创建 Blob
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fullFileName); // 使用实际的文件名
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url); // 释放内存
        link.remove(); // 从DOM中移除元素
        message.success(t(`Successfully downloaded file`) + `: ${fullFileName}`);
      } catch (error) {
        throw error;
      }
    } else {
      message.error('Download failed, please check the network and try again!')
    }
    // console.log(resData);
    // downloadFile(resData.msg1, resData.fileName1);
  }

  return (
    <div className="analGWAS">
      <div className="title">
        {t("GWAS analysis")}
      </div>
      <div className="content">
        {t("GWAS partitioning is a key step in genome-wide association studies, involving the classification of sample data according to specific criteria, such as the division of case and control groups, to compare differences in gene frequencies between individuals with and without disease; Or divide the data into training sets and test sets for building and validating statistical models. In addition, it is possible to stratify the analysis according to demographic characteristics such as race, sex, age, etc., to reduce the influence of confounding factors on the results. Through these divisions, researchers are able to more precisely identify genetic variants associated with specific diseases or traits, improving the science of the study and the reliability of the results.")}
      </div>
      <div className='func'>
        <Form ref={formRef} form={form} onFinish={onFinish}>
          <div className="in">
            <Form.Item rules={[
              {
                required: true,
                message: t('Please upload a VCF file!'),
              },
            ]} name="vcf" label={t("Please upload the genotype data to be analyzed")} className="form-item-layout">
              <Dropdown menu={{ items: vcfItems }} placement='bottom' arrow>
                <Button icon={<UploadOutlined />}>{"vcf " + t("format")}</Button>
              </Dropdown>
              {selectedVcfUploadOption}
              <Upload {...vcfProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id='hidden-upload-vcf'>
                  {"vcf " + t("format")}
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item rules={[
              {
                required: true,
                message: t('Please upload a CSV file!'),
              },
            ]} name="csv" label={t("Upload the single phenotype data to be analyzed")} className="form-item-layout">
              <Dropdown menu={{ items: csvItems }} placement='bottom' arrow>
                <Button icon={<UploadOutlined />}>{"csv " + t("format")}</Button>
              </Dropdown>
              {selectedCsvUploadOption}
              <Upload {...csvProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id='hidden-upload-csv'>
                  {"csv " + t("format")}
                </Button>
              </Upload>
            </Form.Item>
          </div>
          <div className="in">
            <Form.Item className='P-func-item'>
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Submit')}</Button>
            </Form.Item>
            <Form.Item className='P-func-item'>
              <Button onClick={loadFile} disabled={!download}>{t('Download csv files and images')}</Button>
            </Form.Item></div>
        </Form>
      </div>
      <div className="result">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%' }}>
            {/* 渲染图片 */}
            {resArr.map((item, index) => {
              if (item.startsWith('data:image')) {
                return <img key={index} src={item} alt={`Result ${index}`} style={{ width: '100%' }} />;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalGWAS