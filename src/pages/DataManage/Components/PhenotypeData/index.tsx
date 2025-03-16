import { useTranslation } from 'react-i18next';
import './index.scss';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { Empty, message, Spin, Pagination } from 'antd';
import { getPhenotypeDataAPI, getVideoOrObjAPI } from '@/apis';
import { getToken, tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';
import UploadVideo from '@/components/UploadVideo';

const PhenotypeData = ({ dataKey = "data" }) => {

  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();
  const [resData, setResData] = useState([]);
  const [videoUrls, setVideoUrls] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4); // 每页展示5个视频
  const observer = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    console.log("获取表型专属数据库数据");

    async function getData() {
      try {
        const res = await getPhenotypeDataAPI();
        if (res.code === 200) {
          console.log(res.data);
          setResData(res.data);
        } else if (res.code === 401) {
          if (dataKey === "data") {
            tokenLoss(pathname);
          }
        } else {
          message.error(res.msg);
        }
      } catch (error) {
          console.error(error);
      }
    }

    getData();
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement; // 将 entry.target 断言为 HTMLElement 类型
          const { videoPath, plantId } = target.dataset; 
          if (videoPath && plantId) {
            loadVideo(videoPath, plantId);
            observer.current.unobserve(entry.target);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    const startIndex = (currentPage - 1) * pageSize;
    const currentData = resData.slice(startIndex, startIndex + pageSize);

    currentData.forEach(item => {
      const element = document.getElementById(`video-${item.plantId}`);
      if (element) {
        observer.current.observe(element);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [resData, currentPage]);

  // 在视频处理部分添加错误处理和替代方案支持
  const loadVideo = async (videoPath, plantId) => {
    try {
      console.log(`🎬 加载视频 [ID:${plantId}], 路径: ${videoPath}`);
      console.time(`视频加载时间-${plantId}`);
      
      const videoResult = await getVideoOrObjAPI(videoPath);
      console.timeEnd(`视频加载时间-${plantId}`);
      
      // 检查是否需要使用直接URL加载方式(处理416错误)
      if (videoResult.error && videoResult.useDirectUrl) {
        console.log(`🔄 使用直接URL加载视频 [ID:${plantId}]`);
        // 使用代理URL直接加载视频
        const directUrl = videoResult.directUrl;
        
        // 确保视频元素可以使用直接URL播放
        setVideoUrls(prevState => ({ 
          ...prevState, 
          [plantId]: {
            url: directUrl,
            direct: true, // 标记为直接URL
            token: getToken()
          }
        }));
        return;
      }
      
      // 常规方式加载的视频
      if (videoResult.blob && videoResult.url) {
        console.log(`✅ 视频 [ID:${plantId}] 加载成功, 大小: ${videoResult.size} 字节`);
        setVideoUrls(prevState => ({ 
          ...prevState, 
          [plantId]: {
            url: videoResult.url,
            direct: false
          }
        }));
      }
    } catch (error) {
      console.error(`❌ 视频 [ID:${plantId}] 加载失败:`, error);
      // 将视频标记为加载失败
      setVideoUrls(prevState => ({ 
        ...prevState, 
        [plantId]: { error: true, message: error.message } 
      }));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = resData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="manPhenotype">
      {dataKey === "data" && (
        <div>
          <div className='title'>{t('表型专属数据库')}</div>
          <div
            className="upload"
            style={{ position: "sticky", top: "2vh", left: "0", zIndex: "1000" }}
          >
            <UploadVideo />
          </div>
        </div>
      )}
      <div className="res">
        {currentData.length > 0 ? (
          currentData.map((item, index) => (
            <div
              key={index}
              id={`video-${item.plantId}`}
              className="phenotype-item"
              data-video-path={item.videoPath}
              data-plant-id={item.plantId}
            >
              {videoUrls[item.plantId] ? (
                videoUrls[item.plantId].error ? (
                  // 显示错误信息
                  <div className="video-error">
                    <p>视频加载失败</p>
                    <small>{videoUrls[item.plantId].message}</small>
                  </div>
                ) : videoUrls[item.plantId].direct ? (
                  // 使用带有认证token的视频标签直接加载
                  <video 
                    controls
                    crossOrigin="anonymous"
                    preload="metadata"
                    src={`${videoUrls[item.plantId].url}&token=${videoUrls[item.plantId].token}`}
                    onError={(e) => console.error(`视频直接加载失败 [ID:${item.plantId}]:`, e)}
                  ></video>
                ) : (
                  // 使用Blob URL加载
                  <video
                    src={videoUrls[item.plantId].url}
                    controls
                    preload="metadata"
                  ></video>
                )
              ) : (
                // 加载中状态
                <div>
                  <Spin indicator={<LoadingOutlined spin />} size="large" />
                </div>
              )}
              <div className='plantName'>{`Plant Name: ${item.name}`}</div>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </div>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={resData.length}
        onChange={handlePageChange}
        showSizeChanger={false} 
        style={{ textAlign: 'center', marginTop: '20px' }}
      />
      
    </div>
  );
};

export default PhenotypeData;