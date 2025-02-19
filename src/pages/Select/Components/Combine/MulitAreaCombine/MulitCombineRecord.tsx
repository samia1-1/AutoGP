import { downloadMulTrainCombine } from "@/apis";
import { downloadCombineRecord } from "@/utils";
import { message, Table,Checkbox ,Button} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const MulitCombineReocrd = ({records})=>{
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [dataSource, setDataSource] = useState([])
  useEffect(() => {
    const initialDataSource = records
    .map(record => ({
      ...record,
      key: record.trainpredictId,
      createTime: record.createTime.slice(0, 10), // 只取前10个字符
    }));
    setDataSource(initialDataSource);
  }, [records]);
  const { t } = useTranslation();
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 全选
      const allKeys = dataSource.map(record => record.trainpredictId);
      setSelectedRowKeys(allKeys);
    } else {
      // 取消全选
      setSelectedRowKeys([]);
    }
  };
  const onDownload = (path) => {
    console.log(path)
    downloadCombineRecord(path,downloadMulTrainCombine)
  }
  const handleCheckboxChange = (trainpredictId) => {
    const newSelectedRowKeys = selectedRowKeys.includes(trainpredictId)
      ? selectedRowKeys.filter(key => key !== trainpredictId)
      : [...selectedRowKeys, trainpredictId];
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleDelete = () => {
    message.success(`Records with ID:${selectedRowKeys} were successfully deleted`)
    // 执行删除操作，这里是模拟删除
    const newDataSource = dataSource.filter(record => !selectedRowKeys.includes(record.trainpredictId));
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
          onChange={() => handleCheckboxChange(record.trainpredictId)}
        />
      ),
    },
    {
      title: t('Train Id'),
      dataIndex: 'mulTrainPredictId',
      key: 'mulTrainPredictId',
    },
    {
      title: t('Time'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: "VCF "+t('File'),
      dataIndex: 'vcf',
      key: 'vcf',
    },
    {
      title: "CSV "+t('File'),
      dataIndex: 'csv1',
      key: 'csv1',
    },
    {
      title: t("Predict")+' CSV '+t('File'),
      dataIndex: 'csv2',
      key: 'csv2',
    },
    {
      title: t('Model selection'),
      dataIndex: 'predict',
      key: 'predict',
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
          <Button onClick={() => onDownload(record.path)} style={{ marginRight: 16 }}>{t('Download')}</Button>
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

export default MulitCombineReocrd;