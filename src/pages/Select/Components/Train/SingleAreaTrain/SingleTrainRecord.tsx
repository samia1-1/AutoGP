import { message, Table, Button } from "antd";
import { useEffect, useState } from "react";
import { Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { downloadTrainRecord } from "@/utils";
import { download1 } from "@/apis";

const SingleTrainRecord = ({ records }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([])
  useEffect(() => {
    const initialDataSource = records
      .map(record => ({
        ...record,
        key: record.trainId,
        createTime: record.createTime.slice(0, 10), // 只取前10个字符
      }));
    setDataSource(initialDataSource);
  }, [records]);
  const { t } = useTranslation();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 全选
      const allKeys = dataSource.map(record => record.trainId);
      setSelectedRowKeys(allKeys);
    } else {
      // 取消全选
      setSelectedRowKeys([]);
    }
  };
  const onDownload = (path) => {
    downloadTrainRecord(path,download1)
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
          onChange={() => handleCheckboxChange(record.trainId)}
        />
      ),
    },
    {
      title: t('Train ID'),
      dataIndex: 'trainId',
      key: 'trainId',
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
      title: t('csv File'),
      dataIndex: 'csv',
      key: 'csv',
      render: (_, record) => (
        <span>{record.csv} </span>
      ),
    },
    {
      title: t('Model selection'),
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: t('Remarks information'),
      dataIndex: 'ps',
      key: 'ps',
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
  useEffect(() => {
    console.log(records);

  })


  const handleCheckboxChange = (trainId) => {
    const newSelectedRowKeys = selectedRowKeys.includes(trainId)
      ? selectedRowKeys.filter(key => key !== trainId)
      : [...selectedRowKeys, trainId];
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleDelete = () => {
    message.success(`Records with ID:${selectedRowKeys} were successfully deleted`)
    // 执行删除操作，这里是模拟删除
    const newDataSource = dataSource.filter(record => !selectedRowKeys.includes(record.trainId));
    // 更新状态
    setSelectedRowKeys([]);
    setDataSource(newDataSource)
  }
  const handleBulkDownload = () => {
    message.success(`Results with ID:${selectedRowKeys} was successfully downloaded`);
    setSelectedRowKeys([]);
  }

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

export default SingleTrainRecord;