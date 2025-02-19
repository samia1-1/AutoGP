import { useTranslation } from 'react-i18next';
import './index.scss';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { Empty, message, Button, Modal,Spin } from 'antd';
import { getPhenotypeDataAPI } from '@/apis';
import { getToken, tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';



const PhenotypeData = ({ dataKey = "data" }) => {
  const info = () => {
    Modal.info({
      title: t('请扫码上传视频'),
      content: (
        <div>
          <br />
          <img src="/assets/imgs/phenotypeApp.png" alt="" />
        </div>
      ),
      onOk() { },
    });
  };
  const location = useLocation()
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const [resData, setResData] = useState([]); // 用于存储表型数据
  const [videoUrls, setVideoUrls] = useState({}); // 用于存储每个视频的 URL
  const observer = useRef<IntersectionObserver | null>(null); // 保存 Intersection Observer 实例的引用

  useEffect(() => {
    // 每次组件加载时将页面滚动到顶部
    window.scrollTo(0, 0);
  }, [location]);
  useEffect(() => {
    console.log("获取表型专属数据库数据");

    async function getData() {
      try {
        const res = await getPhenotypeDataAPI();
        if (res.code == 200) {
          console.log(res.data);
          setResData(res.data);
        } else if (res.code == 401) {
          if (dataKey === "data") {
            tokenLoss(pathname);
          }
        } else {
          message.error(res.msg)
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error(error); // 捕捉并记录错误（非中止错误）
        }
      }
    }

    getData();
  }, []); // 仅在组件挂载时执行

  useEffect(() => {
    // 创建 Intersection Observer 实例
    observer.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 当目标元素进入视口时
            const target = entry.target as HTMLElement; // 将 entry.target 断言为 HTMLElement 类型
            const { videoPath, plantId } = target.dataset; // 从目标元素的 dataset 中获取视频路径和植物 ID

            if (videoPath && plantId) {
              // 如果 videoPath 和 plantId 存在
              loadVideo(videoPath, plantId); // 加载视频
              observer.current?.unobserve(entry.target); // 加载完视频后停止观察该元素
            }
          }
        });
      },
      {
        root: null, // 相对于视口进行观察
        rootMargin: '100px', // 当元素距离视口 100px 时触发回调
        threshold: 0.1, // 当目标元素的 10% 可见时触发回调
      }
    );

    // 对每个视频容器进行观察
    resData.forEach(item => {
      const element = document.getElementById(`video-${item.plantId}`); // 获取视频元素
      if (element) {
        observer.current?.observe(element); // 开始观察元素
      }
    });

    // 在组件卸载时清理 observer
    return () => {
      if (observer.current) {
        observer.current.disconnect(); // 停止观察所有元素
      }
    };
  }, [resData]); // 依赖 resData，当它变化时重新执行此 effect

  // 加载视频的函数
  const loadVideo = async (videoPath: string, plantId: string) => {
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

      const blob = await response.blob(); // 获取视频的二进制数据
      const url = URL.createObjectURL(blob); // 为视频生成一个临时 URL

      // 将生成的 URL 存储到 state 中
      setVideoUrls(prevState => ({ ...prevState, [plantId]: url }));

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error loading video:', error); // 捕捉并记录错误（非中止错误）
      }
    }
  };

  return (
    <div className="manPhenotype">
      {dataKey === "data" && (
        <div>
          <div className='title'>{t('表型专属数据库')}</div>
          <div
            className="upload"
            style={{ position: "sticky", top: "2vh", left: "0", zIndex: "1000" }}
          >
            <Button onClick={info}>上传视频</Button>
          </div>
        </div>
      )}
      <div className="res">
        {resData.length > 0 ? (
          resData
            .slice(0, dataKey === "personal" ? 4 : resData.length)
            .map((item, index) => (
              <div
                key={index}
                id={`video-${item.plantId}`} // 为每个视频元素设定唯一的 ID
                className="phenotype-item"
                data-video-path={item.videoPath} // 存储视频路径
                data-plant-id={item.plantId} // 存储植物 ID
              >
                {videoUrls[item.plantId] ? (
                  <video
                    src={videoUrls[item.plantId]} // 加载已请求到的视频 URL
                    controls
                  ></video>
                ) : (
                  <div>

                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                  </div>
                )}
                {/* <h3>{`Plant ID: ${item.plantId}`}</h3> */}
                <div className='plantName'>{`Plant Name: ${item.name}`}</div>
              </div>
            ))
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default PhenotypeData;


// 组件初始化与数据获取：

// 在 useEffect 中调用 getPhenotypeDataAPI 获取表型数据，并将其存储在 resData 状态中。
// Intersection Observer 的设置：

// useEffect 设置了 IntersectionObserver 来观察每个视频元素。当元素接近视口时，触发 loadVideo 函数来加载视频，并在加载完成后停止观察该元素。
// 懒加载逻辑：

// loadVideo 函数负责实际的视频数据请求。当视频接近视口时才请求数据，这减少了初始页面加载的压力，优化了性能。
// 组件卸载时的清理：

// 在组件卸载时，通过 disconnect 方法断开 IntersectionObserver，防止内存泄漏。