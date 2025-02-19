
import { useTranslation } from 'react-i18next';
import { Select, Space } from 'antd';
import { Button, Form, Upload, Input, message, Dropdown } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { combineAPI, download3, getPersonalFileAPI, getBoutiqueFileAPI, getShareFileAPI } from '@/apis';
import { file_filter, file_move } from '@/utils';
import { useEffect, useRef, useState } from 'react';
import HelpVideo from '@/components/HelpVideo';

const SingleAreaCombine = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const formRef = useRef(null);

  const [resData, setResData] = useState(null);
  const [model, setModel] = useState('XGBOOST');

  const [uploading, setUploading] = useState(false);
  const [download, setDownload] = useState(false);
  const [download2, setDownload2] = useState(false);

  const [personalFiles, setPersonalFiles] = useState([]);
  const [shareFiles, setShareFiles] = useState([]);
  const [boutiqueFiles, setBoutiqueFiles] = useState([]);

  const [selectedVcfUploadOption, setSelectedVcfUploadOption] = useState(null);
  const [selectedCsvUploadOption, setSelectedCsvUploadOption] = useState(null);
  const [selectedVcf2UploadOption, setSelectedVcf2UploadOption] = useState(null);

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
          file_move(file.key, localStorage.getItem("username"), "train-predict")
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
          file_move(file.key, "share", "train-predict")
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
          file_move(file.key, "boutique", "train-predict")
        }
      })),
    },
  ];

  const csvItems = [
    {
      key: '1',
      label: t("Upload a local file"),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById("hidden-upload-csv").click();
      }
    },
    {
      key: '2',
      label: t("Upload a personal database file"),
      children: file_filter(personalFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "train-predict")
        }
      })),
    },
    {
      key: '3',
      label: t("Upload a shared database file"),
      children: file_filter(shareFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, "share", "train-predict")
        }
      })),
    },
    {
      key: '4',
      label: t("Upload a high-quality resource file"),
      children: file_filter(boutiqueFiles,'csv').map(file => ({
        key: file.key,
        label: file.label,
        icon: <FileTextOutlined />,
        onClick: async () => {
          setSelectedCsvUploadOption(file.key);
          form.setFieldsValue({ csv: file.key });
          // 文件移动
          file_move(file.key, "boutique", "train-predict")
        }
      })),
    },
  ];

  const vcf2Items = [
    {
      key: '1',
      label: t("Upload a local file"),
      icon: <UploadOutlined />,
      onClick: () => {
        document.getElementById("hidden-upload-vcf2").click();
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
          setSelectedVcf2UploadOption(file.key);
          form.setFieldsValue({ vcf2: file.key });
          // 文件移动
          file_move(file.key, localStorage.getItem("username"), "train-predict")
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
          setSelectedVcf2UploadOption(file.key);
          form.setFieldsValue({ vcf2: file.key });
          // 文件移动
          file_move(file.key, "share", "train-predict")
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
          setSelectedVcf2UploadOption(file.key);
          form.setFieldsValue({ vcf2: file.key });
          // 文件移动
          file_move(file.key, "boutique", "train-predict")
        }
      })),
    },
  ];

  const vcfProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'train_predict' },
    onRemove: () => form.setFieldsValue({ vcf: null }),
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        form.setFieldsValue({ vcf: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      setSelectedVcfUploadOption(null);
    },
    accept: ".vcf",
  };

  const csvProps = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'train-predict' },
    onRemove: () => form.setFieldsValue({ csv: null }),
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        form.setFieldsValue({ csv: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      setSelectedCsvUploadOption(null);
    },
    accept: ".csv",
  };

  const vcf2Props = {
    name: 'file',
    action: 'http://218.199.69.63:39600/uploadFile',
    headers: {
      token: `${localStorage.getItem('token_key')}`,
    },
    data: { function: 'train-predict' },
    onRemove: () => form.setFieldsValue({ vcf2: null }),
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        form.setFieldsValue({ vcf2: info.file.name });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      setSelectedVcf2UploadOption(null);
    },
    accept: ".vcf",
  };

  const onFinish = async (values) => {
    setUploading(true);
    message.success(t("Submitted, please wait patiently!"))
    const formData = new FormData();
    formData.append("vcf", values.vcf);
    formData.append("csv", values.csv);
    formData.append("predict", values.vcf2);
    formData.append("model", model);
    formData.append("ps", values.ps || "1");

    try {
      const response = await combineAPI(formData);
      const res = response.data;
      console.log(res);
      if (res.code === "200") {
        if (res.msg1 === undefined) {
          message.error(t("No result. Please check whether the selected file is correct"))
        } else {
          message.success(t("Success! Please download the results!"))
          setResData(res);
          setDownload(true);
          setDownload2(true);
        }
      } else {
        message.error(res.msg1)
      }

    } catch (error) {
      console.error('Training failed:', error);
      message.error(t("Network connection error, please check the network and try again"))
      setUploading(false);
    }
    // 开始训练的按钮
    setUploading(false);
  };

  const loadFile = async () => {
    if (download && resData) {
      const fileName = resData.fileName1;
      // const fileQ = fileName.split("_best_model")[0];
      const fileQ = fileName.split("_R_")[0];
      try {
        const response = await download3(fileName, fileQ);
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', resData.fileName1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();

        message.success(t("Successfully downloaded file") + `: ${resData.fileName1}`);
      } catch (error) {
        throw error;
      }

      if (model === "DNNGP") {
        const fileName2 = resData.fileName2;
        const fileQ2 = fileName2.split("_pca")[0];
        try {
          const response = await download3(fileName2, fileQ2);
          const blob = new Blob([response.data], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', resData.fileName2);
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
          link.remove();

          message.success(t("Successfully downloaded file") + `: ${resData.fileName2}`);
        } catch (error) {
          throw error;
        }
      }
    } 
  };

  const loadFile2 = async () => {
    if (download2 && resData) {
      let fileName3 = resData.fileName2;
      if (model === "DNNGP") {
        fileName3 = resData.fileName3;
      }
      // const fileQ = fileName3.split("_best_model")[0];
      const fileQ = fileName3.split("_R_")[0];
      try {
        const response = await download3(fileName3, fileQ);
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName3);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();

        message.success(t("Successfully downloaded file") + `: ${fileName3}`);
      } catch (error) {
        throw error;
      }
    } 
  };

  const modelChange = (value) => {
    setModel(value);
  };

  return (
    <div className="single">
      <HelpVideo videoPath={'/helpVideo/combine.mp4'}/>
      <Form ref={formRef} form={form} onFinish={onFinish}>
        <Form.Item
          name="vcf"
          label={t('Upload the data of the gene to be trained')}
          className="form-item-layout"
          rules={[{ required: true, message: t('Please upload a VCF file!') }]}
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
          name="csv"
          label={t("Upload the phenotype data of the order to be trained")}
          className="form-item-layout"
          rules={[{ required: true, message: t('Please upload a CSV file!') }]}
        >
          <Dropdown menu={{ items: csvItems }} placement="bottom" arrow>
            <Button><UploadOutlined />{"csv " + t("format")}</Button>
          </Dropdown>
          {selectedCsvUploadOption}
          <Upload {...csvProps} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id="hidden-upload-csv">{"csv " + t("format")}</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="vcf2"
          label={t("Upload the data of the genotype to be predicted")}
          className="form-item-layout"
          rules={[{ required: true, message: t('Please upload a VCF file!') }]}
        >
          <Dropdown menu={{ items: vcf2Items }} placement="bottom" arrow>
            <Button><UploadOutlined />{"vcf " + t("format")}</Button>
          </Dropdown>
          {selectedVcf2UploadOption}
          <Upload {...vcf2Props} style={{ display: 'none' }}>
            <Button style={{ display: 'none' }} id="hidden-upload-vcf2">{"vcf " + t("format")}</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label={t("Model selection")}
          className="form-item-layout"
        >
          <Space wrap>
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
          label={t("Remarks information")}
          className='P-func-item'
          name="ps"
        >
          <Input placeholder={t('Optional, used to note the task information, pay attention to the input content does not generate spaces!')}></Input>
        </Form.Item>
        <Form.Item className='P-func-item'>
          <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>{t('Start training and prediction')}</Button>
        </Form.Item>
        <Form.Item className='P-func-item'>
          <Button onClick={loadFile} disabled={!download}>{t('Download the model file')}</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={loadFile2} disabled={!download2}>{t('Download the CSV file')}</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SingleAreaCombine;