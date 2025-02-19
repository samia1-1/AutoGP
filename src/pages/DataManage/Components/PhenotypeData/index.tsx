import { useTranslation } from 'react-i18next';
import './index.scss';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { Empty, message, Spin, Pagination } from 'antd';
import { getPhenotypeDataAPI } from '@/apis';
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

  const loadVideo = async (videoPath, plantId) => {
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
      setVideoUrls(prevState => ({ ...prevState, [plantId]: url }));

    } catch (error) {
      console.error(error)
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
                <video
                  src={videoUrls[item.plantId]}
                  controls
                ></video>
              ) : (
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
