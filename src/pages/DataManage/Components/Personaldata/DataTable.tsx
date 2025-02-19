
import { Table, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import './style.scss'

const DataTable = ({ dataKey, records, onDownload, onDelete }) => {
  const { t } = useTranslation();

  let filteredRecords = records;
  if (dataKey === 'personal' && records.length > 2) {
    filteredRecords = records.slice(0, 5);  // 只取前两条记录
  }

  // 分页设置
  const paginationConfig = dataKey === 'personal' ? {
    itemRender: (_, type) => {
      if (type === 'next') {
        return <span>...</span>
      }
    }
  } : {};
  const columns = [
    {
      title: t('FileName'),
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: t('File Type'),
      dataIndex: 'fileType',
      key: 'fileType',
    },
    {
      title: t('Upload Time'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: t('#'),
      key: 'action',
      render: (_, record) => (
        <span>
          <Button onClick={() => onDownload(record.fileName)} style={{ marginRight: 16 }}>{t('Download')}</Button>
          <Button onClick={() => onDelete(record.fileName)}>{t('Delete')}</Button>
        </span>
      ),
    },
  ];

  return (
    <Table dataSource={filteredRecords} pagination={paginationConfig} columns={columns} rowKey="fileName" />
  )
};

export default DataTable;
