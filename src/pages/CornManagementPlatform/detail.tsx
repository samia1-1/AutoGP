// UploadVideo.js
import { Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const UploadVideo = () => {
  const { t } = useTranslation();

  const info = () => {
    Modal.info({
      title: t('Please scan code to upload video'),
      content: (
        <div>
          <br />
          <img src="/assets/imgs/phenotypeApp.png" alt="" />
        </div>
      ),
      onOk() { },
    });
  };

  return (
    <div className="upload-video">
      <Button onClick={info}>{t("Upload video")}</Button>
    </div>
  );
};

export default UploadVideo;
