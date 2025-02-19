import { download4 } from "@/apis";
import { downloadOptimalRecord } from "@/utils";
import { message, Table, Button, Checkbox } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const OptimalRecord = ({ records }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [dataSource, setDataSource] = useState([])
  useEffect(() => {
    const initialDataSource = records
      .map(record => ({
        ...record,
        key: record.optimalparentsId,
        createTime: record.createTime.slice(0, 10), // 只取前10个字符
      }));
    setDataSource(initialDataSource);
  }, [records]);
  const { t } = useTranslation();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 全选
      const allKeys = dataSource.map(record => record.optimalparentsId);
      setSelectedRowKeys(allKeys);
    } else {
      // 取消全选
      setSelectedRowKeys([]);
    }
  };
  const onDownload = (path) => {
    downloadOptimalRecord(path, download4)
  }

  const handleCheckboxChange = (optimalparentsId) => {
    const newSelectedRowKeys = selectedRowKeys.includes(optimalparentsId)
      ? selectedRowKeys.filter(key => key !== optimalparentsId)
      : [...selectedRowKeys, optimalparentsId];
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleDelete = () => {
    message.success(`Records with ID:${selectedRowKeys} were successfully deleted`)
    // 执行删除操作，这里是模拟删除
    const newDataSource = dataSource.filter(record => !selectedRowKeys.includes(record.optimalparentsId));
    // 更新状态
    setSelectedRowKeys([]);
    setDataSource(newDataSource)
  }
  const handleBulkDownload = () => {
    message.success(`Results with ID:${selectedRowKeys} was successfully downloaded`);
    setSelectedRowKeys([]);
  }

  const columns = [
    {
      title:
        <Checkbox
          checked={selectedRowKeys.length === dataSource.length}
          onChange={handleSelectAll}
        />,
      dataIndex: 'select',
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={() => handleCheckboxChange(record.optimalparentsId)}
        />
      ),
    },
    {
      title: t('Train Id'),
      dataIndex: 'optimalparentsId',
      key: 'optimalparentsId',
    },
    {
      title: t('Time'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: "VCF " + t('File'),
      dataIndex: 'vcf',
      key: 'vcf',
      render: (_, record) => (
        <span>{record.vcf}</span>
      ),
    },
    {
      title: t("Phenotype") + ' TXT ' + t('File'),
      dataIndex: 'txt',
      key: 'txt',
      render: (_, record) => (
        <span>{record.txt}</span>
      ),
    },
    {
      title: t('Model File'),
      dataIndex: 'model',
      key: 'model',
      render: (_, record) => (
        <span>{record.model}</span>
      ),
    },
    {
      title: 'DNNGP ' + t('Model File'),
      dataIndex: 'model_pca',
      key: 'model_pca',
      render: (_, record) => (
        <span>
          {record.model_pca === null ?
            <span>1</span>
            :
            <span>{record.model_pca}</span>
          }
        </span>
      ),
    },
    {
      title: t('valuenum'),
      dataIndex: 'valuenum',
      key: 'valuenum',
    },
    {
      title: t('#'),
      dataIndex: 'ps',
      key: 'ps',
      render: (_, record) => (
        <span>
          <Button disabled={record.path === null} onClick={() => onDownload(record.path)} style={{ marginRight: 16 }}>{t('Download')}</Button>
        </span>
      ),
    },
  ];
  return (
    <div className="record">
      <Button
        className="record_button button_delete"
        disabled={selectedRowKeys.length === 0}
        onClick={handleDelete}
      >
        {t('Delete records')}
      </Button>&nbsp;&nbsp;&nbsp;&nbsp;
      <Button
        className="record_button button_download"
        disabled={selectedRowKeys.length === 0}
        onClick={handleBulkDownload}
      >
        {t('Bulk download results')}
      </Button>
      <Table
        dataSource={dataSource}
        columns={columns} />
    </div>
  )
}

export default OptimalRecord;