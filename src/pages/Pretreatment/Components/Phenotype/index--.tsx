// obj文件过大时，无法渲染obj
// 可视化obj文件
import { useState, useEffect, useRef } from 'react';
import { Button, message, Select, Modal } from 'antd';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useTranslation } from 'react-i18next';
import { getVideoNameAPI, getVideoOrObjAPI, prePhenotypeAPI } from '@/apis';
import * as THREE from 'three'; // 确保导入 THREE.js
import './index.scss';
import { tokenLoss } from '@/utils';
import { useLocation } from 'react-router-dom';

// 计算两点的距离
const calculateDistance = (point1, point2) => {
  const v1 = new THREE.Vector3(point1.x, point1.y, point1.z);
  const v2 = new THREE.Vector3(point2.x, point2.y, point2.z);
  return v1.distanceTo(v2);
};


const Model = ({ objUrl, onSelectPoint }) => {
  const obj = useLoader(OBJLoader, objUrl);

  // 如果 obj 是数组，获取第一个元素
  const group = Array.isArray(obj) ? obj[0] : obj;
  console.log("group", group);
  // 计算模型的中心
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());

  // 将模型移动到中心
  group.position.sub(center);
  group.rotation.set(Math.PI, 0, 0); // 直接对模型进行翻转
  // 进行翻转的原因：垂直方向只能旋转180度，需要渲染植物的正方向需要反转

  // 翻转后重新计算包围盒和中心
  const newBox = new THREE.Box3().setFromObject(group);
  const newCenter = newBox.getCenter(new THREE.Vector3());
  // 将模型移动到中心
  group.position.sub(newCenter);

  const handlePointerDown = (event) => {
    const { point } = event;
    console.log('Clicked point:', point);
    onSelectPoint(point);
  };

  return (
    <primitive
      object={obj}
      onPointerDown={handlePointerDown}
    />
  );
};




const PrePhenotype = () => {
  const pathname = useLocation().pathname;
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
  const [test, setTest] = useState(false);
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [modelPath, setModelPath] = useState("");
  const [show, setShow] = useState(false);
  const [isTrain, setIsTrain] = useState(false);
  const resultRef = useRef(null);

  const [objUrl, setObjUrl] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const cleanObjData = (data) => {
    setTest(false); // 测试
    return data.replace(/nan/g, "0"); // 将所有 `nan` 替换为 `0`
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // const url = URL.createObjectURL(file);
      // setObjUrl(url);
      // 清除nan值
      const reader = new FileReader();
      reader.onload = function (e) {
        let objData = e.target.result;

        objData = cleanObjData(objData); // 清理 `nan`
        const blob = new Blob([objData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setObjUrl(url);
      }
      reader.readAsText(file);
    };
  }

  const handleSelectPoint = (point) => {
    if (selectedPoints.length < 2) {
      setSelectedPoints((prevPoints) => [...prevPoints, point]);
    } else {
      setSelectedPoints([point]);
    }
  };

  useEffect(() => {
    if (selectedPoints.length === 2) {
      const dist = calculateDistance(selectedPoints[0], selectedPoints[1]);
      setDistance(dist);
    }
  }, [selectedPoints]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVideoNameAPI();
        if (res.code == 200) {
          const data = res.data;
          console.log("表型提取文件数据：", res);
          let dynamicOptions = data.map((item, _) => {

            // 将 videoPath 按照 "/" 分隔，并取最后一个值作为 label
            const pathSegments = item.videoPath.split('/');
            const label = pathSegments[pathSegments.length - 1];
            // setModelPath(item.modelPath)
            return {
              value: item.plantId, // 使用索引作为 value
              // label:'Plant ID: '+item.plantId,  // 将 ID 作为 label
              label: item.name,
              videoName: label,
              flag: item.modelPath ? true : false,
              modelPath: item.modelPath,
            }
          });

          setOptions(dynamicOptions);
        } else if (res.code == 401) {
          // message.error("用户认证失败，请重新登录!")
          tokenLoss(pathname);
        } else {
          message.error(res.msg)
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSelectChange = (_, option) => {
    setVideoId(option.value);
    // setShow(option.flag);
    setIsTrain(option.flag);
    setModelPath(option.modelPath)
  }

  const onFinish = async () => {
    if (!videoId) {
      message.error(t("请选择需要进行提取的视频") + "!")
    } else {
      const formData = new FormData();
      formData.append("id", videoId)
      console.log("选择的视频：", videoId);
      if (!isTrain) {
        try {
          const res = await prePhenotypeAPI(formData);
          if (res.code == 200) {
            message.success("模型已开始建立，请稍后查看结果");
          } else {
            message.error(res.msg);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // 展示obj文件
        console.log(modelPath);

        try {
          message.success("已提交，正在加载中...")
          const filePath = modelPath
          const data = await getVideoOrObjAPI(filePath);
          console.log(data);
          let response = typeof data === 'string' ? data : JSON.stringify(data);
          response = cleanObjData(response); // 清除 `nan` 值
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          setObjUrl(url); // Set the OBJ URL to render the model
          message.success("已成功提取模型")
          setShow(true);
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          console.error(error);
          message.error("模型文件不存在！")
          setShow(false);
        }
      }
    }
  }

  return (
    <div className="prePhenotype">
      <div className="top">
        <div className="title">
          {t("表型提取")}
        </div>
        <div className="img">
          <img src="/assets/imgs/obj/obj2.jpg" alt="" />
          <img src="/assets/imgs/obj/obj3.jpg" alt="" />
          <img src="/assets/imgs/obj/obj4.jpg" alt="" />
        </div>
        <div className="main">
          <div className="label">
            {t("请选择需要进行提取的视频")}：
          </div>
          <div className="in">
            <Select
              showSearch
              placeholder={t("请选择一个视频")}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options} // 在此处绑定动态选项
              onChange={handleSelectChange}
              style={{ width: 270 }}
            />
          </div>
          <div className="submit">
            <Button type='primary' onClick={onFinish}>{t("提交")}</Button>
          </div>

          <div
            className="upload"
          >
            <Button onClick={info}>{t("上传视频")}</Button>
          </div>
          <div className="content">
            {t("用户可以点击下拉框选择数据库中的已有数据进行表型提取，或者点击上传数据，扫描弹出的二维码后，通过小程序上传的视频。视频上传后从下拉框选择数据点击提交，后台即可进行三维重建，待重建完成后（一般45min以上），下滑页面可看到三维模型并进行表型提取。")}
          </div>
        </div>
      </div>
      <div
        className="result_in"
        ref={resultRef}
        style={{ display: show ? 'block' : 'block' }}>
        {
          test === false &&
          <div className='in'>
            <input type="file" accept=".obj" onChange={handleFileUpload} />
          </div>
        }
        <div className="result">
          {/* <div className="point" style={{backgroundColor:"pink",display:"block",width:'20px',height:"20px"}}> */}
          <div className="point">
            {selectedPoints.length >= 1 && (
              <p>{t("点")} 1: {`(${selectedPoints[0].x.toFixed(2)}, ${selectedPoints[0].y.toFixed(2)}, ${selectedPoints[0].z.toFixed(2)})`}</p>
            )}
            {selectedPoints.length === 2 && (
              <div>
                <p>{t("点")} 2: {`(${selectedPoints[1].x.toFixed(2)}, ${selectedPoints[1].y.toFixed(2)}, ${selectedPoints[1].z.toFixed(2)})`}</p>
                {distance && (
                  <div className="len">
                    {t("两点的距离")}：{`${distance.toFixed(2)}`}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="canvas-container">
            <Canvas
              raycaster={{
                params: {
                  Mesh: {},
                  Line: { threshold: 1 },
                  LOD: {},
                  Points: { threshold: 0.1 },
                  Sprite: {}
                }
              }}
            >
              <ambientLight />
              {/* <pointLight position={[10, 10, 10]} /> */}
              <OrbitControls
                target={[0, 0, 0]}

                maxPolarAngle={Math.PI}  // 允许相机从顶部看到底部
                minPolarAngle={-Math.PI}        // 允许相机从底部看到顶部
              />
              {objUrl && <Model
               objUrl={objUrl}
                onSelectPoint={handleSelectPoint}
                 />}
            </Canvas>
          </div>
        </div>
        <div className="content">
          {t("用户通过鼠标点击即可获取两点之间的距离，该距离为一个相对值，如需获取真实长度可根据三维模型中的参照物等比例换算得到。")} 3D 模型中进行精确几何测量的专业领域，如生物形态学、建筑工程和制造业，具有重要意义，能够有效支持用户进行复杂的空间数据分析和决策。
        </div>
      </div>
    </div>
  )
}

export default PrePhenotype;


// import './index.scss'
// const app = ()=>{
//   return(
//     <div className="app">
//     app</div>
//   )
// }
// export default app

