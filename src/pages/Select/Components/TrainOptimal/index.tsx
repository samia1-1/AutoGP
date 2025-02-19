import {
  Button, Form, Upload,
  Space, Select,
  Input, message, Dropdown,
  Table,
} from 'antd';
import { useEffect, useState, useRef } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getTrainOptimalRecord, getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI, trainOptimalAPI, download5 } from '@/apis';
import TrainOptimalRecord from './TrainOptimalRecord';
import { file_filter, file_move2, tokenLoss } from '@/utils';
import './index.scss';
import { useLocation } from 'react-router-dom';
import HelpVideo from '@/components/HelpVideo';

const TrainOptimal = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [resData, setResData] = useState(null);
  const [result, setResult] = useState({})
  const [record, setRecord] = useState([]);

  const [personalFiles, setPersonalFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);

  const [model, setModel] = useState('XGBOOST');
  const [selectedVcfTrain_UploadOption, setSelectedVcfTrain_UploadOption] = useState(null);
  const [selectedCsvTrain_UploadOption, setSelectedCsvTrain_UploadOption] = useState(null);
  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedTxtUploadOption, setSelectedTxtUploadOption] = useState(null);

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
      const res = (await getTrainOptimalRecord());
      if (res.code == 200) {
        setRecord(res.data);
      } else if (res.code == 401) {
        tokenLoss(pathname);
      } else {
        message.error(res.msg);
      }
    }
    fetchData();
  }, []);


  const vcfTrainProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'train',
    },
    onRemove: () => {
      form.setFieldsValue({ vcf_train: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ vcf_train: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedVcfTrain_UploadOption(null);
    },
    accept: '.vcf',
  };

  const csvTrainProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: {
      function: 'train',
    },
    onRemove: () => {
      form.setFieldsValue({ csv_train: null });
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        form.setFieldsValue({ csv_train: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      setSelectedCsvTrain_UploadOption(null);
    },
    accept: '.csv',
  };
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
      setSelectedTxtUploadOption(null);
    },
    accept: ".txt",
  };

  const onFinish = async values => {
    setUploading(true);
    message.success(t("Submitted, please wait patiently!"))
    let formData = new FormData();
    formData.append("vcf1", values.vcf_train);
    formData.append("csv", values.csv_train);
    formData.append("vcf2", values.vcf);
    formData.append("txt", values.txt);
    formData.append("model", model);
    formData.append("num", values.valuenum + '');

    // 输出 FormData 内容
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    try {
      const response = await trainOptimalAPI(formData);

      const res = response;
      if (res.code == 200) {
        if (res.fileName1 === undefined) {
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
      } else {
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
        const fileName = resData.fileName1;
        const fileQ = fileName.split("_R_")[0];
        const response = await download5(resData.fileName1, fileQ);
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
  const loadFile2 = async () => {
    if (download && resData) {
      try {
        const fileName = resData.fileName2;
        const fileQ = fileName.split("_R_")[0];
        const response = await download5(resData.fileName2, fileQ);
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resData.fileName2);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        message.success(t(`Successfully downloaded file`) + `: ${resData.fileName2}`);
      } catch (error) {
        throw error;
      }
    }
  };


  const vcf_train_Items = [
    {
      key: '1',
      label: t('Upload a local file'),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById('hidden-upload-vcf-train').click();
      },
    },
    {
      key: '2',
      label: t('Upload a personal database file'),
      children: file_filter(personalFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfTrain_UploadOption(file.key);
          form.setFieldsValue({ vcf_train: file.key });
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "train_selection")
        },
      })),
    },
    {
      key: '3',
      label: t('Upload a shared database file'),
      children: file_filter(shareFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfTrain_UploadOption(file.key);
          form.setFieldsValue({ vcf_train: file.key });
          // 文件移动
          file_move2(file.key, "share", "train_selection")
        },
      })),
    },
    {
      key: '4',
      label: t('Upload a high-quality resource file'),
      children: file_filter(boutiqueFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfTrain_UploadOption(file.key);
          form.setFieldsValue({ vcf_train: file.key });
          // 文件移动
          file_move2(file.key, "boutique", "train_selection")
        },
      })),
    },
  ];

  const csv_train_Items = [
    {
      key: '1',
      label: t('Upload a local file'),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById('hidden-upload-csv-train').click();
      },
    },
    {
      key: '2',
      label: t('Upload a personal database file'),
      children: file_filter(personalFiles, 'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvTrain_UploadOption(file.key);
          form.setFieldsValue({ csv_train: file.key });
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "train_selection")
        },
      })),
    },
    {
      key: '3',
      label: t('Upload a shared database file'),
      children: file_filter(shareFiles, 'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvTrain_UploadOption(file.key);
          form.setFieldsValue({ csv_train: file.key });
          // 文件移动
          file_move2(file.key, "share", "train_selection")
        },
      })),
    },
    {
      key: '4',
      label: t('Upload a high-quality resource file'),
      children: file_filter(boutiqueFiles, 'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvTrain_UploadOption(file.key);
          form.setFieldsValue({ csv_train: file.key });
          // 文件移动
          file_move2(file.key, "boutique", "train_selection")
        },
      })),
    },
  ];

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
      children: file_filter(personalFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "train_selection")

        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move2(file.key, "share", "train_selection")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles, 'vcf').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedVcfUploadOption(file.key);
          form.setFieldsValue({ vcf: file.key });
          // 文件移动
          file_move2(file.key, "boutique", "train_selection")
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
      children: file_filter(personalFiles, 'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move2(file.key, localStorage.getItem("username"), "train_selection")
        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles, 'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move2(file.key, "share", "train_selection")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles, 'txt').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedTxtUploadOption(file.key);
          form.setFieldsValue({ txt: file.key });
          // 文件移动
          file_move2(file.key, "boutique", "train_selection")
        }
      })),
    },
  ];
  const modelChange = value => {
    console.log(`selected ${value}`);
    setModel(value);
  };
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
    <div className='train_optimal'>
      <div className='header'>
        <div className='title'>{t('Integrated training and selection')}</div>
        <div className='content'>
          {t("Use cutting-edge machine learning and deep learning algorithms! Simply enter the genetic and phenotypic data, select the model you want, and the platform will automatically train the model for you to achieve an efficient prediction process. You'll have accurate predictions at your fingertips to inform your research and decision-making process.")}
        </div>
        <div className='content'>
          {t('By accurately assessing and comparing the genetic traits of candidate individuals, the most suitable male or female parent for reproduction is selected to optimize and improve the traits of the offspring.')}
        </div>

      </div>
      <div className='container'>
        <div className='func'>
          <HelpVideo videoPath={'/helpVideo/five.mp4'} />
          <Form ref={formRef} form={form} onFinish={onFinish}>
            <Form.Item
              name='vcf_train'
              label={t('Upload the data of the gene to be trained')}
              className='form-item-layout'
              rules={[
                {
                  required: true,
                  message: t('Please upload a VCF file!'),
                },
              ]}
            >
              <Dropdown menu={{ items: vcf_train_Items }} placement='bottom' arrow>
                <Button>
                  <UploadOutlined />
                  {'vcf ' + t('format')}
                </Button>
              </Dropdown>
              {selectedVcfTrain_UploadOption}
              <Upload {...vcfTrainProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id='hidden-upload-vcf-train'>
                  {'vcf ' + t('format')}
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name='csv_train'
              label={t('Upload the phenotype data of the order to be trained')}
              className='form-item-layout'
              rules={[
                {
                  required: true,
                  message: t('Please upload a CSV file!'),
                },
              ]}
            >
              <Dropdown menu={{ items: csv_train_Items }} placement='bottom' arrow>
                <Button>
                  <UploadOutlined />
                  {'csv ' + t('format')}
                </Button>
              </Dropdown>
              {selectedCsvTrain_UploadOption}
              <Upload {...csvTrainProps} style={{ display: 'none' }}>
                <Button style={{ display: 'none' }} id='hidden-upload-csv-train'>
                  {'csv ' + t('format')}
                </Button>
              </Upload>
            </Form.Item>
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
            <Form.Item
              rules={[{ required: true, message: t('Please enter the desired phenotype value size!') }]}
              name="valuenum" label={t("Expected phenotypic value size")} className="P-func-item">
              <Input placeholder={t("Please enter a number/'Min'/'Max'")}></Input>
            </Form.Item>
            <Form.Item className='P-func-item'>
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Submit')}</Button>
            </Form.Item>

            <Form.Item className='P-func-item'>
              <Button onClick={loadFile} disabled={!download}>{t('Download the model file')}</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={loadFile2} disabled={!download}>{t('Download the CSV file')}</Button>
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
          <TrainOptimalRecord records={record} />
        </div>
      </div>
    </div>
  );
};

export default TrainOptimal;
