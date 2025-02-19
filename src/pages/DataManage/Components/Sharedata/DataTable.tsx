import { Table, Button } from 'antd';
// import { useSelector } from 'react-redux';
// import { AppState } from '@/store/types';
import { useTranslation } from 'react-i18next';

const DataTable = ({ dataKey,records, onDownload, onDelete }) => {
  
  // const username = useSelector((state: AppState) => state.user.username); // 获取当前登录用户名
  const { t } = useTranslation();
  const username = localStorage.getItem('username')
  
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
      title: t('Author'),
      dataIndex: 'userName',
      key: 'userName',
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
          {record.userName === username||username === "admin" ? (
            <Button onClick={() => onDelete(record.fileName)}>{t("Delete")}</Button>
          ) : null}
        </span>
      ),
    },
  ];

  return <Table dataSource={filteredRecords} pagination={paginationConfig} columns={columns} rowKey="fileName" />;
};

export default DataTable;
