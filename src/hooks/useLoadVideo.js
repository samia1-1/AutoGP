import { useState } from 'react';
import { getToken } from '@/utils';

// 自定义 Hook 用于加载视频
const useLoadVideo = () => {
  const [videoUrls, setVideoUrls] = useState([]); // 存储每个视频的 URL

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

      const blob = await response.blob(); // 获取视频的二进制数据
      const url = URL.createObjectURL(blob); // 为视频生成一个临时 URL

      // 将生成的 URL 存储到 state 中
      setVideoUrls(prevState => ({ ...prevState, [plantId]: url }));

    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  return { videoUrls, loadVideo };
};

export default useLoadVideo;
