import { download5 } from "@/apis";
import { downloadFiveRecord } from "@/utils";
import { message, Table, Button,Checkbox } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const TrainOptimalRecord = ({ records }) => {
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
  const onDownload = (path,path_csv) => {
    if(path){
      downloadFiveRecord(path,download5)
      downloadFiveRecord(path_csv,download5)
    }
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
      dataIndex: 'trainSelectionId',
      key: 'trainSelectionId',
    },
    {
      title: t('Time'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: "VCF " + t('File'),
      dataIndex: 'vcf1',
      key: 'vcf1',
    },
    {
      title: "CSV " + t('File'),
      dataIndex: 'csv',
      key: 'csv',
    },
    {
      title: "VCF " + t('File'),
      dataIndex: 'vcf2',
      key: 'vcf2',
    },
    {
      title: "TXT " + t('File'),
      dataIndex: 'txt',
      key: 'txt',
    },
    {
      title: t("Phenotype") + ' TXT ' + t('File'),
      dataIndex: 'txt',
      key: 'txt',
    },
    {
      title: t('Model File'),
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: t('valuenum'),
      dataIndex: 'num',
      key: 'num',
    },
    {
      title: t('#'),
      dataIndex: 'ps',
      key: 'ps',
      render: (_, record) => (
        <span>
          <Button disabled={record.pathZip===undefined||record.pathZip===null} onClick={() => onDownload(record.pathZip,record.pathCsv)} style={{ marginRight: 16 }}>{t('Download')}</Button>
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

export default TrainOptimalRecord;