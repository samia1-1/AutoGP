import React, { useEffect, useState } from 'react';
import { Input, message, Space, Table } from 'antd';
import { Button, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';


import './index.scss'
import { useTranslation } from 'react-i18next';
import { getToken } from '@/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPicture, getprovincePage } from '@/apis';
import EnvData from './EnvData';
// import { useNavigate } from 'react-router-dom';
const { Column, ColumnGroup } = Table;

interface DataType {
  key: React.Key;
  name: string,
  ripeVedio: string,
  ripevPath: string,
  ripePoint: string,
  ripepPath: string,
  height: string;
  leaveNum: string;
  angle: string;
  image?: string; // 新增字段，用于存储图片 URL
  image_p?: string;  // 用于存储点云图片
}

const findVideoDetail = (path) => {
  console.log(path)
}

const ProvinceDetail = () => {
  const [provinceData, setProvinceData] = useState([])
  const [filteredData, setFilteredData] = useState([]); // 用于存储搜索过滤后的数据
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const province = params.get('province');
  const { chineseName } = location.state || {};

  const { t } = useTranslation();
  // const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const showVideoModal = (path) => {
    findVideoDetail(path)
    loadVideo(path)
    setIsVideoModalOpen(true);
  };


  const handleOk = () => {
    setVideoUrl(null)
    setIsVideoModalOpen(false);
  };
  const [videoUrl, setVideoUrl] = useState(null)
  const loadVideo = async (videoPath) => {
    try {
      const response = await fetch(`http://218.199.69.63:39600/corn/download?filePath=${videoPath}`, {
        method: 'GET',
        headers: {
          token: getToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

    } catch (error) {
      console.error(error)
    }
  };
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);

  const handleEnvOk = () => {
    setIsEnvModalOpen(false);
  };
  const findPlyDetail = async (plypath) => {
    console.log("点云路径：", plypath)
    if (plypath !== null) {
      navigate(`/cimp/ply_detail?url=${plypath}`)
    } else {
      message.error("暂无数据！")
    }
  }
  const handleBackClick = () => {
    navigate('/cimp/china_map');
  };

  function getDataTemp(page) {
    // const area = province
    const area = 'ShanXi'
    console.log(area);
    // getAllPage(page)
    getprovincePage(area, page)
      .then((data) => {
        setProvinceData(data.data)
        setFilteredData(data.data); // 初始显示所有数据
        setPagination({
          ...pagination,
          current: page,
          total: Number(data.msg.split('：')[1]) * 10, // 设置总条目数
        })
      })
  }
  async function getData(page) {
    let area = ''
    try {
      console.log(area);

      const data = await getprovincePage(area, page);
      console.log("temp data:", data)
      const enrichedData = await Promise.all(
        data.data.map(async (item) => {
          if (item.ripevPath) {
            const pictureBlob = await getPicture(item.ripevPath); // 获取图片的 Blob 对象
            const pictureUrl = URL.createObjectURL(pictureBlob);
            item.image = pictureUrl; // 保存为图片 URL
          } else {
            item.image = null; // 没有图片时设置为 null
          }
          if (item.ripepPath) {
            const pictureBlobP = await getPicture(item.ripepPath); // 获取点云图片的 Blob 对象
            const pictureUrlP = URL.createObjectURL(pictureBlobP);
            item.image_p = pictureUrlP; // 保存为点云图片 URL
            console.log(pictureUrlP)
          } else {
            item.image_p = null; // 没有点云图片时设置为 null
          }
          return item;
        })
      );
      setProvinceData(enrichedData); // 更新状态
      setFilteredData(enrichedData); // 初始显示所有数据
      setPagination({
        ...pagination,
        current: page,
        total: Number(data.msg.split('：')[1]) * 10, // 设置总条目数
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }


  useEffect(() => {
    if (province === "ShanXi") {
      getDataTemp(1)
    } else {
      getData(pagination.current)
    }
  }, [])
  // 分页变化事件
  const handleTableChange = (newPagination) => {
    getData(newPagination.current);
  };

  // 用于控制环境数据的显示与隐藏
  const [showEnvData, setShowEnvData] = useState(false);
  const toggleEnvData = () => {
    setShowEnvData(!showEnvData);
  };
  // 搜索框输入变化时触发
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 根据输入的关键词过滤数据
    const filtered = provinceData.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };
  return (
    <div className="corn_platform">
      <div className="title">{chineseName} 历史性品种群体多环境表型的遗传解析</div>
      <div className="province_title">
        <div className="back"
          onClick={handleBackClick}
        >
          &lt;返回
        </div>
      </div>
      <div className="table_console"
        style={{ textAlign: 'left' }}
      >
        <Button onClick={toggleEnvData}>
          {showEnvData ? '隐藏环境数据' : '显示环境数据'}

        {/* 搜索框 */}
        </Button>
        
        <Input
          placeholder="根据作物名搜索"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 200, marginLeft: '20px' }}
        />
      </div>
      {showEnvData && <EnvData />}     {/* 环境数据 */}
      <Modal title={<p>视频数据</p>}
        open={isVideoModalOpen}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleOk}>
            确定
          </Button>,
        ]}
      >
        {videoUrl ? <video
          style={{ width: "300px" }}
          src={videoUrl}
          controls
        ></video>
          :

          <div>
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>}
      </Modal>
      <Modal title={<p>环境数据详情</p>}
        open={isEnvModalOpen}
        onCancel={handleEnvOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleEnvOk}>
            {t("确定")}
          </Button>,
        ]}
      >
        <p>...</p>
        <p>...</p>
      </Modal>
      <div
        className="corn_table table_item"
      >
        <Table<DataType>

          style={{ textAlign: 'center' }}
          dataSource={filteredData}
          pagination={{
            current: pagination.current,
            pageSize: 10,
            total: pagination.total,
            showSizeChanger: false, // 禁用每页条数切换
          }}

          onChange={handleTableChange} // 监听分页变化
        >
          <Column title="作物名" dataIndex="name" key="name" align='center' />
          <ColumnGroup title="成熟期">
            <Column
              title="视频数据"
              dataIndex="videoPath"
              key="videoPath"
              align='center'
              render={(_: any, record: DataType) => (
                <Space size="middle">
                  {record.ripeVedio ? (
                    <a onClick={() => showVideoModal(record.ripeVedio)} href="javascript:;">
                      {record.image && <img src={record.image} alt="视频详情" style={{ width: '100px', height: '150px' }} />}
                    </a>
                  ) : (
                    <span>暂无数据</span>
                  )}
                </Space>
              )}
            />
            <Column
              title="点云数据"
              dataIndex="modelPath"
              key="modelPath"
              align='center'
              render={(_: any, record: DataType) => (
                <Space size="middle">
                  <a onClick={() => findPlyDetail(record.ripePoint)} href="javascript:;">
                    {record.image_p && <img src={record.image_p} alt="点云详情" style={{ width: '100px', height: '150px' }} />}
                    {!record.ripePoint && <div>暂无详细数据</div>}
                  </a>

                </Space>
              )}
            />
          </ColumnGroup>
          <ColumnGroup title="表型数据">
            <Column title="01" dataIndex="phenotypic01" key="phenotypic01" align='center' />
            <Column title="02" dataIndex="phenotypic02" key="phenotypic02" align='center' />
            <Column title="03" dataIndex="phenotypic03" key="phenotypic03" align='center' />
          </ColumnGroup>
        </Table>
      </div>
    </div>
  )
}
export default ProvinceDetail;