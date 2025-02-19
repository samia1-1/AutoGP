import { download2 } from "@/apis";
import { downloadPredictRecord } from "@/utils";
import { Table, Checkbox, message, Button } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const SinglePredictRecord = ({ records }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [dataSource, setDataSource] = useState([])
  useEffect(() => {
    const initialDataSource = records
    .map(record => ({
      ...record,
      key: record.predictId,
      createTime: record.createTime.slice(0, 10), // 只取前10个字符
    }));
    setDataSource(initialDataSource);
  }, [records]);
  const { t } = useTranslation();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 全选
      const allKeys = dataSource.map(record => record.predictId);
      setSelectedRowKeys(allKeys);
    } else {
      // 取消全选
      setSelectedRowKeys([]);
    }
  };
  const onDownload = (path) => {
    downloadPredictRecord(path,download2)
  }
  const handleCheckboxChange = (predictId) => {
    const newSelectedRowKeys = selectedRowKeys.includes(predictId)
      ? selectedRowKeys.filter(key => key !== predictId)
      : [...selectedRowKeys, predictId];
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleDelete = () => {
    message.success(`Records with ID:${selectedRowKeys} were successfully deleted`)
    // 执行删除操作，这里是模拟删除
    const newDataSource = dataSource.filter(record => !selectedRowKeys.includes(record.predictId));
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
          onChange={() => handleCheckboxChange(record.predictId)}
        />
      ),
    },
    {
      title: t('Train Id'),
      dataIndex: 'predictId',
      key: 'predictId',
    },
    {
      title: t('Time'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: t('vcf File'),
      dataIndex: 'vcf',
      key: 'vcf',
      render: (_, record) => (
        <span>{record.vcf}</span>
      ),
    },
    {
      title: t('Model File'),
      dataIndex: 'model1',
      key: 'model1',
      render: (_, record) => (
        <span>{record.model1}</span>
      ),
    },
    {
      title: 'DNNGP ' + t('Model File'),
      dataIndex: 'model2',
      key: 'model2',
      render: (_, record) => (
        <span>{record.model2}</span>
      ),
    },
    {
      title: t('#'),
      dataIndex: 'ps',
      key: 'ps',
      render: (_, record) => (
        <span>
          <Button disabled={record.path===null} onClick={() => onDownload(record.path)} style={{ marginRight: 16 }}>{t('Download')}</Button>
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
      <Table dataSource={dataSource} columns={columns} />
    </div>
  )
}

export default SinglePredictRecord;