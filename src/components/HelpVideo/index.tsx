import { QuestionCircleOutlined } from '@ant-design/icons';
import { FloatButton, Modal, Button, Spin, Tooltip } from 'antd';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const HelpVideo = ({ videoPath }) => {
  const {t} = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleEnvOk = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="help_video_container">
      <Tooltip title={t("View the help video")}>
        <FloatButton
          onClick={showModal}
          icon={<QuestionCircleOutlined />}
          type="primary"
          style={{
            position: 'fixed',
            top: '3vh',
            right: '3vw',
          }}
        />
      </Tooltip>

      <Modal
        open={isModalOpen}
        onCancel={handleEnvOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleEnvOk}>
            确定
          </Button>,
        ]}
        width="60vw"      // 设置宽度为 50vw
        bodyStyle={{
          height: '40vh',  // 设置高度为 40vh
          padding: 0,
          textAlign: 'center',
        }}
      >
        <video ref={videoRef}

          style={{
            width: '100%',
            height: '100%',
          }}
          controls
        >
          <source src={videoPath} type="video/mp4" />
          <Spin size="large" />
        </video>
      </Modal>
    </div>
  );
};

export default HelpVideo;
