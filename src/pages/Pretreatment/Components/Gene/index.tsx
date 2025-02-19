import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, message, Upload, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadPreGeneAPI, getBoutiqueFileAPI, getPersonalFileAPI, getShareFileAPI, preGeneAPI } from '@/apis';
import './index.scss'
import { file_move2, tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';

const PreGene = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);

  const [vcfFileName, setVcfFileName] = useState('');    // 文件名

  const [uploading, setUploading] = useState(false);   // true 表示开始训练
  const [download, setDownload] = useState(false);   // 下载文件按钮
  const [resData, setResData] = useState(null);   // 保存最终结果 文件下载地址

  useEffect(() => {
    async function getPersonalFile() {
      const res = (await getPersonalFileAPI()).data;
      if (res.code == 200) {
        const updatedFiles = res.data.map(file => ({
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
        const updatedFiles = res.data.map(file => ({
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
        const updatedFiles = res.data.map(file => ({
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
          setVcfFileName(file.key);
          file_move2(file.key, localStorage.getItem("username"), "jxjj_code_v2");
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
          setVcfFileName(file.key);
          file_move2(file.key, "share", "jxjj_code_v2");
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
          setVcfFileName(file.key);
          file_move2(file.key, "boutique", "jxjj_code_v2");
        },
      })),
    },
  ];


  const props = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFileNew',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'jxjj_code_v2',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          message.success(`${info.file.name} ${t("File uploaded successfully")}`);
          setVcfFileName(info.file.name); // 绑定上传的文件名到vcfFileName
          setSelectedVcfUploadOption('')
        } else if (info.file.response.code == 401) {
          message.error(t("User authentication failed, please log in again!"))
        }
        else {
          message.error(info.file.response.msg)
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} ${t("File upload failure")}`);
      }
    },
    accept: ".vcf",
  };

  const onFinish = async () => {
    if (vcfFileName) {
      setUploading(true)
      message.success(t("Submitted, please wait patiently!"))
      const formData = new FormData();
      formData.append("vcf", vcfFileName)
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      try {
        const res = (await preGeneAPI(formData)).data;
        console.log(res);
        if (res.code == 200) {
          message.success(t("Extract successful, please download to view the results!"))
          setResData(res.fileName1)
          setDownload(true);
        } else if (res.code == 401) {
          message.error(t("User authentication failed, please log in again!"))
        } else {
          message.error(res.msg)
        }
      } catch (error) {
        console.log(t("Network connection error, please check the network and try again"));
      }
    } else {
      message.error(t("Please upload a VCF file!"));
    }
    setUploading(false);
  };


  // 修改下载文件结接口
  const loadFile = async () => {
    if (download && resData) {

      const part = resData.split('/');
      const fullFileName = part[part.length - 1];

      const lastDotIndex = fullFileName.lastIndexOf('.');
      const fileQ = fullFileName.substring(0, lastDotIndex);
      try {
        const response = await downloadPreGeneAPI(fullFileName, fileQ);
        console.log(response);
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fullFileName);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url); // 清理内存中的引用
        link.remove(); // 清理DOM中的元素
        message.success(t(`Successfully downloaded file`) + `: ${fullFileName}`)
      } catch (error) {
        throw error;
      }
    } else {
      message.error(t('Download failed, please refresh and try again!'))
    }
    // console.log(resData);
    // downloadFile(resData.msg1, resData.fileName1);
  }

  return (
    <div className="preGene">
      <div className="title">{t("High-Quality SNPs Extraction")}</div>
      <div className="img">
        <img style={{ 'width': "40vh" }} src="/assets/imgs/gene1.jpg" alt="" />
      </div>
      <div className="main">
        <div className="label">{t("Please upload the genotype data to be analyzed")}：</div>
        {/* <div className="in">
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>VCF {t("格式")}</Button>
          </Upload>
        </div> */}
        <div className="in">
          <Dropdown menu={{ items: vcfItems }} placement='bottom' arrow>
            <Button icon={<UploadOutlined />}>VCF {t("format")}</Button>
          </Dropdown>
          {selectedVcfUploadOption}
          <Upload {...props} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id='hidden-upload-vcf'>
              VCF {t("format")}
            </Button>
          </Upload>
        </div>
        <div className="submit">
          <Button onClick={onFinish} type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t("Submit")}</Button>
        </div>
        <div className="res">
          <Button onClick={loadFile} disabled={!download}>{t("Download results")}</Button>
        </div>
      </div>
      <div className="content">
        {t("Selective gene extraction is a technique to obtain specific gene sequences from biological samples, which is widely used in genetic research, medical diagnosis and biotechnology. The process includes collecting samples, extracting and purifying DNA, amplifying target genes using PCR, validating gene fragments by electrophoresis and sequencing, and extracting and purifying target genes. This technology ensures efficient and accurate access to genes for genome editing, disease diagnosis, drug development, and agricultural improvement.")}
      </div>
    </div>
  )
}

export default PreGene;
