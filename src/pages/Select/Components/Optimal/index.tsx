import { Button, Form, Upload, Input, message, Table, Dropdown } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { download4, getOptimalRecord, optimalAPI, getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI } from '@/apis';
import OptimalRecord from './OptimalRecord';
import { file_filter, file_move, tokenLoss } from '@/utils';
import './index.scss';
import { useLocation } from 'react-router-dom';
import HelpVideo from '@/components/HelpVideo';

const Optimal = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [resData, setResData] = useState(null);
  const [result, setResult] = useState({})
  const [record, setRecord] = useState([]);

  const [dnngpFiles, setDnngpFiles] = useState(null);
  const [isShowDnngp, setIsShowDnngp] = useState(false);

  const [personalFiles, setPersonalFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedTxtUploadOption, setSelectedTxtUploadOption] = useState(null);
  const [selectedModelUploadOption, setSelectedModelUploadOption] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [download, setDownload] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      const personalRes = (await getPersonalFileAPI()).data;
      if (personalRes.code === 200) {
        setPersonalFiles(personalRes.data.map(file => ({ key: file.fileName + "." + file.fileType, label: file.fileName + "." + file.fileType })));
      }
      const boutiqueRes = (await getBoutiqueFileAPI()).data;
      if (boutiqueRes.code === 200) {
        setBoutiqueFiles(boutiqueRes.data.map(file => ({ key: file.fileName + "." + file.fileType, label: file.fileName + "." + file.fileType })));
      }
      const shareRes = (await getShareFileAPI()).data;
      if (shareRes.code === 200) {
        setShareFiles(shareRes.data.map(file => ({ key: file.fileName + "." + file.fileType, label: file.fileName + "." + file.fileType })));
      }
    }
    fetchFiles();
  }, []);

  

  useEffect(() => {
    async function fetchData() {
      const res = (await getOptimalRecord()).data;
      if (res.code === 200) {
        setRecord(res.data);
      } else if(res.code==401){
        tokenLoss(pathname);
      }else {
        message.error(res.msg);
      }
    }
    fetchData();
  }, []);

  const vcfProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'optimal_parents' },
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
    accept: ".vcf",
  };

  const txtProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'optimal_parents' },
    onRemove: () => {
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ txt: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedModelUploadOption(null);
    },
    accept: ".txt",
  };

  const modelProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'optimal_parents' },
    onRemove: () => {
      form.setFieldsValue({ model: null });
      setIsShowDnngp(false);
      setSelectedModelUploadOption(null);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ model: info.file.name });
        setIsShowDnngp(info.file.name.includes('DNNGP'));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedModelUploadOption(null);
    },
    accept: ".zip",
  };
  const dnngpProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'optimal_parents' },
    onRemove: () => {
      form.setFieldsValue({ dnngp: null });
      setDnngpFiles(null);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ dnngp: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    accept: ".zip",
  };

  const onFinish = async values => {
    setUploading(true);
    message.success(t("Submitted, please wait patiently!"))
    let formData = new FormData();
    formData.append("vcf", values.vcf);
    formData.append("txt", values.txt);
    formData.append("model", values.model);
    formData.append("model_pca", values.dnngp || "1");
    formData.append("valuenum", values.valuenum);
    console.log(dnngpFiles);

    // 输出 FormData 内容
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    try {
      const response = await optimalAPI(formData);

      const res = response.data;
      if (res.code === "200") {
        if (res.msg1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          message.success(t("Success! Please download the results!"))
          setResData(res);
          setResult({
            "matrix2": res.matrix2,
            "matrix3": res.matrix3,
            "matrix4": res.matrix4,
            "matrix5": res.matrix5,
            "matrix6": res.matrix6,
          })
          setDownload(true);
        }
      }else{
        message.error(res.msg)
      }
    } catch (error) {
      message.error("Network connection error, please check the network and try again")
      setUploading(false);
    }
    setUploading(false);
  };

  const loadFile = async () => {
    if (download && resData) {
      try {
        const response = await download4(resData.fileName1);
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resData.fileName1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        message.success(t(`Successfully downloaded file`) + `: ${resData.fileName1}`);
      } catch (error) {
        throw error;
      }
    } 
  };

  const vcfItems = [
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
          file_move(file.key, localStorage.getItem("username"), "optimal_parents")

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
          file_move(file.key, "share", "optimal_parents")
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
          file_move(file.key, "boutique", "optimal_parents")
        }
      })),
    },
  ];

  const txtItems = [
    {
      key: '1',
      label: t("Upload a local file"),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById("hidden-upload-txt").click();
      }
    },
    {
      key: '2',
      label: t("Upload a personal database file"),
      children: file_filter(personalFiles,'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "optimal_parents")
        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles,'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move(file.key, "share", "optimal_parents")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles,'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move(file.key, "boutique", "optimal_parents")
        }
      })),
    },
  ];

  const modelItems = [
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
          setIsShowDnngp(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "optimal_parents")
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
          setIsShowDnngp(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, "share", "optimal_parents")
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
          setIsShowDnngp(file.key.includes('DNNGP'));
          // 文件移动
          file_move(file.key, "boutique", "optimal_parents")
        }
      })),
    },
  ];

  const dataResult = Object.keys(result).map(key => {
    if (Object.getOwnPropertyNames(result).length !== 0) {
      const parts = result[key].split(/\s+/); // 根据空格分割字符串
      return {
        key: key,
        aaa: parts[0],
        id: parts[1],
        predict: parts[2]
      };
    } else {
      return {}
    }
  });

  const columns = [
    {
      title: ' ',
      dataIndex: 'aaa',
      key: 'aaa'
    },
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'predict',
      dataIndex: 'predict',
      key: 'predict'
    }
  ];

  return (
    <div className='optimal'>
      <div className='header'>
        <div className='title'>{t('Selection of optimal parents')}</div>
        <div className='content'>{t('By accurately assessing and comparing the genetic traits of candidate individuals, the most suitable male or female parent for reproduction is selected to optimize and improve the traits of the offspring.')}</div>
      </div>
      <div className='container'>
        <div className='func'>
        <HelpVideo videoPath={'/helpVideo/optimal.mp4'}/>
          <Form ref={formRef} form={form} onFinish={onFinish}>
            <Form.Item
              name="vcf"
              label={t("Upload hybrid parent genotype data")}
              className="form-item-layout"
              rules={[{ required: true, message: t('Please upload a VCF file!') }]}
            >
              <Dropdown menu={{ items: vcfItems }} placement="bottom" arrow>
                <Button><UploadOutlined />{"vcf " + t("format")}</Button>
              </Dropdown>
              {selectedVcfUploadOption}
              <Upload {...vcfProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id="hidden-upload-vcf">{"vcf " + t("格式")}</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="txt"
              label={t("Gene sequence txt file of the material to be hybridized")}
              className="form-item-layout"
              rules={[{ required: true, message: t('Please upload the phenotype TXT file!') }]}
            >
              <Dropdown menu={{ items: txtItems }} placement="bottom" arrow>
                <Button><UploadOutlined />{"txt " + t("format")}</Button>
              </Dropdown>
              {selectedTxtUploadOption}
              <Upload {...txtProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id="hidden-upload-txt">{"txt " + t("格式")}</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="model"
              label={t("Upload model weights")}
              className="form-item-layout"
              rules={[{ required: true, message: t('Please select a model') }]}
            >
              <Dropdown menu={{ items: modelItems }} placement="bottom" arrow>
                <Button><UploadOutlined />{"zip " + t("format")}</Button>
              </Dropdown>
              {selectedModelUploadOption}
              <Upload {...modelProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id="hidden-upload-model">{"zip " + t("格式")}</Button>
              </Upload>
            </Form.Item>
            {isShowDnngp &&
              <Form.Item name="dnngp" label={t("Whether it is a DNNGP model")} className="form-item-layout">
                <Upload {...dnngpProps}>
                  <Button icon={<UploadOutlined />} style={{ fontSize: '1.6vh', width: '10vw' }}></Button>
                </Upload>
              </Form.Item>
            }
            <Form.Item
              rules={[{ required: true, message: t('Please enter the desired phenotype value size!') }]}
              name="valuenum" label={t("Expected phenotypic value size")} className="P-func-item">
              <Input placeholder={t("Please enter a number/'Min'/'Max'")}></Input>
            </Form.Item>
            <Form.Item className='P-func-item'>
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Submit')}</Button>
            </Form.Item>
            <Form.Item className='P-func-item'>
              <Button onClick={loadFile} disabled={!download}>{t('Download!')}</Button>
            </Form.Item>
          </Form>
          <div className='footer'>
            {resData &&
              <div>
                <Table columns={columns} dataSource={dataResult} pagination={false} />
              </div>
            }
          </div>
        </div>
        <div className="divider"></div>
        <div className='history'>
          <div className='title'>{t('Records')}</div>
          <OptimalRecord records={record} />
        </div>
      </div>
    </div>
  );
};

export default Optimal;
