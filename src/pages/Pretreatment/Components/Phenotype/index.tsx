import { useState, useEffect, useRef } from 'react';
import { Button, message, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getVideoNameAPI, getVideoOrObjAPI, prePhenotypeAPI } from '@/apis';
import { tokenLoss } from '@/utils';
import './index.scss';
import PlyInteraction from '@/pages/Pretreatment/Components/Phenotype/PlyInteraction';
import UploadVideo from '../../../../components/UploadVideo';
import { useLocation } from 'react-router-dom';

const PrePhenotype = () => {
  
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [modelPath, setModelPath] = useState("");
  const [show, setShow] = useState(false);
  const [isTrain, setIsTrain] = useState(false);
  const resultRef = useRef(null);
  const [referPheno,setReferPheno] = useState({height:0,leaveNum:0,angle:0})

  const [plyUrl, setPlyUrl] = useState(null);

  const cleanPlyData = (data) => {
    return data.replace(/nan/g, "0"); // 将所有 `nan` 替换为 `0`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVideoNameAPI();
        if (res.code == 200) {
          const data = res.data;
          let dynamicOptions = data.map((item, _) => {
            const pathSegments = item.videoPath.split('/');
            const label = pathSegments[pathSegments.length - 1];
            return {
              value: item.plantId,
              label: item.name,
              videoName: label,
              flag: item.modelPath ? true : false,
              modelPath: item.modelPath,
              height:item.height,
              leaveNum:item.leaveNum,
              angle:item.angle
            };
          });
          setOptions(dynamicOptions);
        } else if (res.code == 401) {
          tokenLoss(pathname);
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSelectChange = (_, option) => {
    setVideoId(option.value);
    setIsTrain(option.flag);
    setModelPath(option.modelPath);
  };

  const onFinish = async () => {
    if (!videoId) {
      message.error(t("Please select the video you want to extract") + "!");
    } else {
      console.log(options[videoId])
      setReferPheno({height:options[videoId].height,leaveNum:options[videoId].leaveNum,angle:options[videoId].angle})
      // message.success(t("Submitted, please wait patiently!"))
      const formData = new FormData();
      formData.append("id", videoId);
      if (!isTrain) {
        try {
          const res = await prePhenotypeAPI(formData);
          if (res.code == 200) {
            message.success(t("The model is being built. Check the results later")+"!");
          } else {
            message.error(res.msg);
          }
        } catch (error) {
          message.success(t("Network connection error, please check the network and try again"))
          console.error(error);
        }
      } else {
        // 展示 ply 文件
        try {
          message.success(t("Committed, loading... Please don't leave!"));
          const filePath = modelPath;
          const data = await getVideoOrObjAPI(filePath);
          let response = typeof data === 'string' ? data : JSON.stringify(data);
          response = cleanPlyData(response); // 清除 `nan` 值
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          setPlyUrl(url);
          message.success(t("The model was successfully extracted!"));
          setShow(true);
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          console.error(error);
          message.error(t("The model file does not exist!"));
          setShow(false);
        }
      }
    }
  };



  return (
    <div className="prePhenotype">
      <div className="top">
        <div className="title">{t("Phenotype extraction")}</div>
        <div className="img">
          <img src="/assets/imgs/obj/ply.png" alt="" />
        </div>
        <div className="main">
          <div className="label">{t("Please select the video you want to extract")}：</div>
          <div className="in">
            <Select
              showSearch
              placeholder={t("Please select a video")}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options}
              onChange={handleSelectChange}
              style={{ width: 270 }}
            />
          </div>
          <div className="submit">
            <Button type="primary" onClick={onFinish}>
              {t("Submit")}
            </Button>
          </div>

          <div className="upload" >
            <UploadVideo />
          </div>
          <div className="content">
            {t(
              "Users can click the drop-down box to select the existing data in the database for phenotype extraction, or click upload data, scan the pop-up two-dimensional code, and upload the video through the small program. After the video is uploaded, select data from the drop-down box and click Submit, and the background can carry out 3D reconstruction. After the reconstruction is completed (generally more than 45 minutes), you can slide down the page to see the 3D model and extract the phenotype."
            )}
          </div>
        </div>
      </div>
      <div className="res">
        <PlyInteraction
        show={show}
        plyUrl={plyUrl}
        setPlyUrl={setPlyUrl}
        referPheno={referPheno}
      />
      </div>
    </div>
  );
};

export default PrePhenotype;
