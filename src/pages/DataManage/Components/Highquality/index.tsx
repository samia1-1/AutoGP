

import './index.scss'
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';


import { useEffect, useState } from 'react';
import DataTable from './DataTable';
import RecordForm from './RecordForm';
import { message } from 'antd';
import { deleteBoutiqueFileAPI, downloadBoutiqueFileAPI, getBoutiqueFileAPI } from '@/apis';
import { useLocation } from 'react-router-dom';
import { tokenLoss } from '@/utils';

interface Record {
  fileName: string,
  fileType: string,
  fileStatus: number,
  createTime: string,
  nickName: string | null,
  note: string | null,
  userId: number
}


const Highquality = ({ dataKey = "data" }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [records, setRecords] = useState<Record[]>([]);
  const [editingRecord] = useState<Record | null>(null);
  const { t } = useTranslation();
  const [refreshData] = useState(false);
  const user = localStorage.getItem('username');

  useEffect(() => {
    // 每次组件加载时将页面滚动到顶部
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    async function getData() {
        const data = (await getBoutiqueFileAPI()).data;
        if (data.code === 200) {
          console.log('Data:', data);
          console.log(data.data);
          setRecords(
            data.data.map(record => ({
              ...record,
              createTime: record.createTime ? record.createTime.slice(0, 10) : ''
            }))
          )
        }else if(data.code==401){
          if(dataKey==="data"){
            tokenLoss(pathname);
          }
        }else{
          message.error(data.msg)
        } 
    }
    getData()
  }, [refreshData])
  // 上传文件
  // const handleSave = (record: Record) => {
  //   if (editingRecord) {
  //     const updatedRecords = records.map(item => item.fileName === editingRecord.fileName ? { ...record, fileName: editingRecord.fileName } : item);
  //     setRecords(updatedRecords);
  //     setEditingRecord(null);
  //   } else {
  //     const newRecord = { ...record, id: records.length + 1 }; // 自动分配一个新ID
  //     setRecords([...records, newRecord]);
  //   }
  //   message.success(t('记录已保存！'));
  // };

  // 下载文件
  const handleDownload = async (fileName: string) => {
    const record = records.find(item => item.fileName === fileName) || null; // 如果未找到记录，返回 null
    // setEditingRecord(record);
    console.log(record)
    console.log(fileName);
    try {
      const response = await downloadBoutiqueFileAPI(fileName + "." + record.fileType)
      const fullFileName = fileName + "." + record.fileType;
      const res = response.data;
      console.log(res);
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fullFileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url); // 清理内存中的引用
      link.remove(); // 清理DOM中的元素

      message.success(t(`Successfully downloaded file`) + `: ${fileName}`)
    } catch (error) {
      console.error('Training failed:', error);
      message.error(t("Network connection error, please check the network and try again"));
    }
  };

  // 删除文件
  const handleDelete = (fileName: string) => {
    Modal.confirm({
      title: t('Confirm file deletion'),
      content: t(`Whether to confirm the deletion of the file`) + `：${fileName}`,
      async onOk() {
        // setRecords(records.filter(item => item.fileName !== fileName));
        try {
          const record = records.find(item => item.fileName === fileName) || null; // 如果未找到记录，返回 null
          console.log(fileName)
          const response = await deleteBoutiqueFileAPI(fileName + "." + record.fileType)
          const res = response.data;
          if (res.code == 200) {
            console.log(res);
            message.success(t('The file has been deleted!'));
            setRecords(records => records.filter(item => item.fileName !== fileName))
          } else {
            message.error(res.msg)
          }
        } catch (error) {
          console.error('Training failed:', error);
          message.error(t("Network connection error, please check the network and try again"));
        }
      },
      onCancel() {
        console.log(t('取消删除'));
      },
    });
  };

  return (
    <div className='Highquality'>
      {
        dataKey === "data" &&
        <div><div className='title'>{t('High-quality databases')}</div>
          {user === "admin" &&
            <RecordForm record={editingRecord} setRecords={setRecords} records={records} />
          }
        </div>
      }
      <div className="table">
        <DataTable dataKey={dataKey} records={records} onDownload={handleDownload} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Highquality;
