import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload, Table, Dropdown } from 'antd';
import JSZip from 'jszip';
import { QuestionCircleOutline } from 'antd-mobile-icons'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import './index.scss';
import { analysisPhenotypeAPI, downloadAnalysisPhenotypeAPI, getBoutiqueFileAPI, getPersonalFileAPI, getShareFileAPI } from '@/apis';
import { file_move2, tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';

const Phenotype = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();

  const [personalFiles, setPersonalFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  // const [resData, setResData] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [resFileName, setResFileName] = useState('')
  const [imgArr, setImgArr] = useState([]);

  const [uploading, setUploading] = useState(false)
  const [download, setDownload] = useState(false);   // 下载按钮

  const resRef = useRef(null);

  // 获取三个数据库文件信息
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
          setUploadedFileName(file.key);
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "description_v2");
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
          setUploadedFileName(file.key);
          // 文件移动
          file_move2(file.key, "share", "description_v2");
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
          setUploadedFileName(file.key);
          // 文件移动
          file_move2(file.key, "boutique", "description_v2");
        },
      })),
    },
  ];

  const uploadProps: UploadProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFileNew',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'description_v2',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          message.success(`${info.file.name} file uploaded successfully`);
          setUploadedFile(info.file.originFileObj);
          setUploadedFileName(info.file.name);
          // 读取文件内容
          const reader = new FileReader();
          reader.onload = (e) => {
            const csv = Papa.parse(e.target.result, { header: true });
            setCsvData(csv.data);
          };
          reader.readAsText(info.file.originFileObj);
        } else if (info.file.response.code == 401) {
          message.error(t("User authentication failed, please log in again!"))
        }
        else {
          message.error(info.file.response.msg)
        }

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setUploadedFile(null);
      }
    },
    accept: '.csv',
  };

  const onFinish = async () => {
    if (uploadedFileName) {
      message.success(t("Submitted, please wait patiently!"))
      setUploading(true);
      console.log('Uploaded file:', uploadedFile);
      console.log('fileName:', uploadedFileName);
      console.log("csv", selectedCsvUploadOption);
      const formData = new FormData()
      formData.append("csv", uploadedFileName)
      // 调用接口
      try {
        const res = (await analysisPhenotypeAPI(formData)).data;
        console.log(res);
        if (res.code == 200) {
          setResFileName(res.fileName1);

          // 调用下载接口，获取ZIP文件
          const fullFileName = res.fileName1.split('/').pop(); // 获取文件名
          const fileQ = fullFileName.split('.').shift(); // 去掉扩展名
          const response = await downloadAnalysisPhenotypeAPI(fullFileName, fileQ);
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
              setImgArr([...newImgArr]);
            }
          });
          setDownload(true);
          setUploading(false);
        } else if (res.code == 401) {
          message.error(t("User authentication failed, please log in again!"))
        } else {
          message.error(res.msg)
        }
      } catch (error) {
        message.error(t("Network connection error, please check the network and try again"))
      }
      if (resRef.current) {
        resRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      message.error('请上传待分析的csv文件');
    }
  };

  const renderTable = () => {
    if (!csvData || csvData.length === 0) {
      return null;
    }
    const columns = Object.keys(csvData[0]).map(key => ({
      title: key,
      dataIndex: key,
      key,
    }));

    return <Table
      dataSource={csvData}
      className="phenotype-table"
      columns={columns}
      rowKey={(_, index) => {
        // console.log(record);
        return index
      }}
      pagination={{ pageSize: 30 }}
      title={() => t("Raw data")}
    />;
  };

  const loadImg = async () => {
    if (download && resFileName !== '') {
      console.log(resFileName);
      const part = resFileName.split('/');
      const fullFileName = part[part.length - 1];

      const lastDotIndex = fullFileName.lastIndexOf('.');
      const fileQ = fullFileName.substring(0, lastDotIndex);
      try {
        const response = await downloadAnalysisPhenotypeAPI(fullFileName, fileQ);
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
        console.error("前端错误", error);
        message.error(t(`Failed to download file`));
      }
    }
  };




  return (
    <div className="phenotype">
      <div className="title">{t("Phenotypic data analysis")}</div>
      <div className="img">
        <img src="/assets/imgs/analysis_p_1.png" alt="" />
        <img src="/assets/imgs/analysis_p_2.png" alt="" />
        <img src="/assets/imgs/analysis_p_3.png" alt="" />
        <img src="/assets/imgs/analysis_p_4.png" alt="" />
      </div>
      <div className="func">
        <div className="middle">
          {/* <div className="upload">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>{t('上传csv文件')}</Button>
            </Upload>
          </div> */}
          <div className="upload">
            <Dropdown menu={{ items: csvItems }} placement='bottom' arrow>
              <Button icon={<UploadOutlined />}>{t('Uploading a csv file')}</Button>
            </Dropdown>
            {selectedCsvUploadOption}
            <Upload {...uploadProps} style={{ display: 'none' }}>
              <Button style={{ display: 'none' }} id='hidden-upload-csv'>
                {'csv ' + t('format')}
              </Button>
            </Upload>
          </div>
          <div className="submit">
            <Button onClick={onFinish} type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
              {t('Submit')}
            </Button>
          </div>
        </div>
        <div className="content">
          {t(`The phenotype data analysis function is designed to simplify the process of analyzing data in CSV format. After the user uploads the CSV file, the system processes and analyzes the data, and generates five description charts for the user to view. This feature not only improves the efficiency of data analysis, but also provides users with convenient chart viewing and download options, making data analysis results easier to understand and share.`)}
        </div>
      </div>
      <div className="res" ref={resRef}>
        <div className="left">
          {imgArr.length !== 0 &&
            <div className="image-gallery">
              {imgArr.map((src, index) => (
                <img key={index} src={src} alt={`Image ${index + 1}`} />
              ))}
            </div>

          }
          {csvData && imgArr.length === 0 &&
            <Empty
              style={{ padding: '64px 0' }}
              image={
                <QuestionCircleOutline
                  style={{
                    color: 'var(--adm-color-light)',
                    fontSize: 48,
                  }}
                />
              }
              description='No data available'
            />
          }
        </div>
        <div className="source_data">
          {renderTable()}
        </div>
      </div>
      {imgArr.length !== 0 &&
        <div className="btn">
          <Button onClick={loadImg} type="primary">{t("Download pictures")}</Button>
        </div>
      }
    </div>
  );
};

export default Phenotype;
