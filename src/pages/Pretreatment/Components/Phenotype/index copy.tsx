import { useState, useEffect, useRef } from 'react';
import { Button, message, Select, Modal, List, Descriptions, Input } from 'antd';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { useTranslation } from 'react-i18next';
import { Html } from '@react-three/drei';
import { getVideoNameAPI, getVideoOrObjAPI, prePhenotypeAPI } from '@/apis';
import * as THREE from 'three';
import { tokenLoss } from '@/utils';
import './index.scss';
import { useLocation } from 'react-router-dom';

// 计算两点的距离
const calculateDistance = (point1, point2) => {
  const v1 = new THREE.Vector3(point1.x, point1.y, point1.z);
  const v2 = new THREE.Vector3(point2.x, point2.y, point2.z);
  return v1.distanceTo(v2);
};

const Model = ({ plyUrl, onSelectPoint, leavesPoints, selectedPoints, referPoint, countPoints, distancePoint }) => {
  const plyGeometry = useLoader(PLYLoader, plyUrl);

  // 检查 plyGeometry 是否是数组，如果是则使用第一个元素
  const geometry = Array.isArray(plyGeometry) ? plyGeometry[0] : plyGeometry;

  const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
  const points = new THREE.Points(geometry, material);
  const box = new THREE.Box3().setFromObject(points);
  const center = box.getCenter(new THREE.Vector3());
  points.position.sub(center);

  const handlePointerDown = (event) => {
    if (event.intersections.length > 0) {
      const { point } = event.intersections[0];
      console.log('Clicked point:', point);
      onSelectPoint(point);
      // 只处理第一个交点，阻止进一步处理
      // 确保每次点击只调用一次 handleSelectPoint
      event.stopPropagation();
    } else {
      console.log('No valid point clicked.');
    }
  };


  return (
    // <primitive
    //   object={points}
    //   onPointerDown={handlePointerDown}
    // />
    <>
      <primitive
        object={points}
        onPointerDown={handlePointerDown}
      />
      {/* 高亮显示选中的点 */}
      {leavesPoints.map((highlightedPoint, index) => (
        <mesh key={index} position={highlightedPoint}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color="red" />
          {/* 在高亮点附近显示计数 */}
          {countPoints && (
            <Html position={[0.02, 0.02, 0]}>
              <div style={{ color: 'black', fontSize: '10px', background: 'white', padding: '2px', borderRadius: '4px' }}>
                {index + 1}
              </div>
            </Html>
          )}
          <Html position={[0.02, 0.02, 0]}>
            <div style={{ color: 'black', fontSize: '10px', background: 'white', padding: '2px', borderRadius: '4px' }}>
              {index + 1}
            </div>
          </Html>
        </mesh>
      ))}
      {/* 两个点 */}
      {distancePoint.map((selectedPoint, index) => (
        <mesh key={index} position={selectedPoint}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
      {distancePoint.length === 2 && (
        <line>
          <bufferGeometry
            attach="geometry"
            attributes={{
              position: new THREE.Float32BufferAttribute(
                [
                  selectedPoints[0].x,
                  selectedPoints[0].y,
                  selectedPoints[0].z,
                  selectedPoints[1].x,
                  selectedPoints[1].y,
                  selectedPoints[1].z,
                ],
                3
              ),
            }}
          />
          <lineBasicMaterial attach="material" color="red" />
        </line>
      )}
      {/* 渲染选中的参照点为蓝色并连线 */}
      {referPoint.map((referPoint, index) => (
        <mesh key={`refer-${index}`} position={referPoint}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      ))}
      {referPoint.length === 2 && (
        <>
          <line>
            <bufferGeometry
              attach="geometry"
              attributes={{
                position: new THREE.Float32BufferAttribute(
                  [
                    referPoint[0].x,
                    referPoint[0].y,
                    referPoint[0].z,
                    referPoint[1].x,
                    referPoint[1].y,
                    referPoint[1].z,
                  ],
                  3
                ),
              }}
            />
            <lineBasicMaterial attach="material" color="blue" linewidth={8} />
          </line>
        </>
      )}
    </>
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
  const [formal, setFormal] = useState(false);   // 为false渲染上传文件按钮（测试ply文件用）
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [modelPath, setModelPath] = useState("");
  const [show, setShow] = useState(false);
  const [isTrain, setIsTrain] = useState(false);
  const resultRef = useRef(null);

  // 控制交互界面
  const [isShowInitBox, setIsShowInitBox] = useState(true);    // 初始界面（两个按钮：自动提取/交互提取）
  const [isShowReferBox, setIsShowReferBox] = useState(false);   // 是否显示参考表型
  const [isShowInteractiveBox, setIsShowInteractiveBox] = useState(false)    // 是否显示交互提取

  const [plyUrl, setPlyUrl] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [distance, setDistance] = useState(null);

  const [distancePoint, setDistancePoint] = useState([]);    // 两个计算距离的点
  const [leavesPoints, setLeavesPoints] = useState([]); // 用于存储叶子点

  const [isReferenceSet, setIsReferenceSet] = useState(false);  // 参照物ok
  const [showReferencePrompt, setShowReferencePrompt] = useState(false);   // 弹出指示：选择参照物
  const [referPoint, setReferPoint] = useState([]);  // 保存参照物的点

  const cleanPlyData = (data) => {
    setFormal(false); // 测试
    return data.replace(/nan/g, "0"); // 将所有 `nan` 替换为 `0`
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 使用 FileReader 读取二进制数据
      const reader = new FileReader();
      reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setPlyUrl(url);
      };
      reader.readAsArrayBuffer(file); // 读取文件为二进制
    }
  };

  const handleSelectPoint = (point) => {
    if (isShowInteractiveBox) {
      if (!isReferenceSet) {
        // message.warning("请先选取参照物并输入真实长度后点击'OK'");
        // return;
        if (referPoint.length === 2) {
          setReferPoint([point]);
        } else {
          setReferPoint((prevPoints) => {
            const newPoints = [...prevPoints, point];
            if (newPoints.length === 2) {
              const dist = calculateDistance(newPoints[0], newPoints[1]);
              setReferLength(dist); // 计算并设置参照物的距离
            }
            return newPoints;
          });
        }
        return;
      }
      if (isCounting) {
        // 计数模式下，只增加 leavesNum，不做距离计算
        setLeavesNum((prev) => prev + 1);
        // 添加选中的叶子点
        setLeavesPoints((prev) => [...prev, point]);
      } else {
        // 正常模式下，选择点并计算距离
        setSelectedPoints(prevPoints => {
          if (prevPoints.length >= 2) {
            setDistancePoint([point])
            return [point];
          } else {
            setDistancePoint([...prevPoints, point])
            return [...prevPoints, point];
          }
        });
      }
    }
  };


  useEffect(() => {
    if (selectedPoints.length === 2) {
      const dist = calculateDistance(selectedPoints[0], selectedPoints[1]);
      setDistance(dist);
    }
  }, [selectedPoints, isReferenceSet]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVideoNameAPI();
        if (res.code == 200) {
          const data = res.data;
          console.log("表型提取文件数据：", res);
          let dynamicOptions = data.map((item, _) => {
            const pathSegments = item.videoPath.split('/');
            const label = pathSegments[pathSegments.length - 1];
            return {
              value: item.plantId,
              label: item.name,
              videoName: label,
              flag: item.modelPath ? true : false,
              modelPath: item.modelPath,
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
      message.error(t("请选择需要进行提取的视频") + "!");
    } else {
      const formData = new FormData();
      formData.append("id", videoId);
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
        // 展示 ply 文件
        try {
          message.success("已提交，正在加载中...");
          const filePath = modelPath;
          const data = await getVideoOrObjAPI(filePath);
          let response = typeof data === 'string' ? data : JSON.stringify(data);
          response = cleanPlyData(response); // 清除 `nan` 值
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          setPlyUrl(url);
          message.success("已成功提取模型");
          setShow(true);
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          console.error(error);
          message.error("模型文件不存在！");
          setShow(false);
        }
      }
    }
  };


  // 参考表型
  const data = [
    'Please wait...',
    'Please wait...',
    'Please wait...',
  ];
  // 参照物
  const [referLength, setReferLength] = useState<number | undefined>(undefined);  // 参照物相对长度
  const [referTrueLength, setReferTrueLength] = useState('');


  const referInfo = [
    {
      key: '1',
      label: t('Relative length of reference'),
      children: referPoint.length === 2 && `${Number(referLength).toFixed(2)}`,
    },
    {
      key: '2',
      label: t('Enter the true length'),
      children: <>
        <Input
          style={{ backgroundColor: "rgba(255,255,255,.5)" }}
          value={referTrueLength} // 绑定 referTrueLength 的值
          onChange={(e) => setReferTrueLength(e.target.value)}
        />
        <p>cm &nbsp;&nbsp;</p>
      </>
    },
  ]
  const onReferChange = () => {
    setReferPoint([]);
    setIsReferenceSet(false);
    setSelectedPoints([]);
    setLeavesPoints([])
    setDistancePoint([]);
    setLeavesNum(0);
    setReferTrueLength("");
  }
  const onReferOK = () => {
    if (referPoint.length === 2) {
      console.log('Reference points selected:', referPoint);
      if (referTrueLength) {
        message.success("Reference selected successfully!")
        setTimeout(() => {
          setCountingModePrompt("Interactive mode")
          setTimeout(() => {
            setCountingModePrompt('');
          }, 2000);
        }, 500)   // 0.5s后显示交互模式，1s后隐藏
        setIsReferenceSet(true); // 确认参照物
        setShowReferencePrompt(false); // 隐藏提示
      } else {
        message.warning("Please enter the true length of the reference!")
      }
    } else {
      message.warning("Please select exactly two reference points.");
    }
    console.log(referLength);
    console.log(referTrueLength);
  }

  const beginExtraction = () => {
    setIsShowReferBox(false);
    setIsShowInteractiveBox(true);

    if (!isReferenceSet && isShowInteractiveBox) {
      setShowReferencePrompt(true); // 显示提示
      setTimeout(() => {
        setShowReferencePrompt(false); // 2 秒后隐藏提示
      }, 2000);
      return;
    }
  }
  const viewRefer = () => {
    setIsShowInteractiveBox(false);
    setIsShowReferBox(true);
  }
  // 点及其距离信息
  const pointInfo = [
    {
      key: '1',
      label: t('Initial point'),
      children: selectedPoints.length >= 1 && `(${selectedPoints[0].x.toFixed(2)}, ${selectedPoints[0].y.toFixed(2)}, ${selectedPoints[0].z.toFixed(2)})`,
    },
    {
      key: '2',
      label: t('Termination point'),
      children: selectedPoints.length === 2 && `(${selectedPoints[1].x.toFixed(2)}, ${selectedPoints[1].y.toFixed(2)}, ${selectedPoints[1].z.toFixed(2)})`,
    },
    {
      key: '3',
      label: t('True distance'),
      children: selectedPoints.length === 2 && `${((distance * parseFloat(referTrueLength)) / referLength).toFixed(2)} cm`,
    },
  ]
  // 叶片数量
  const [leavesNum, setLeavesNum] = useState(0);
  const [isCounting, setIsCounting] = useState(false); // 新增状态，控制是否为计数模式
  const leavesItem = [
    {
      key: '1',
      label: t('Number of blades'),
      children: leavesNum,
    },
  ]

  const onLeavesNumReset = () => {
    setLeavesNum(0);
    setLeavesPoints([])
  };

  // 在进行计数模式和交互模式切换时，显示提示
  const [countingModePrompt, setCountingModePrompt] = useState('');
  const onLeavesNumBegin = () => {
    setIsCounting(!isCounting);
    const modeMessage = isCounting ? t("Interactive mode") : t("Counting mode");
    setCountingModePrompt(modeMessage);
    setTimeout(() => {
      setCountingModePrompt('');
    }, 1000);
  };
  return (
    <div className="prePhenotype">
      <div className="top">
        <div className="title">{t("Phenotype extraction")}</div>
        <div className="img">
          <img src="/assets/imgs/obj/obj2.jpg" alt="" />
          <img src="/assets/imgs/obj/obj3.jpg" alt="" />
          <img src="/assets/imgs/obj/obj4.jpg" alt="" />
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
            <Button onClick={info}>{t("Upload video")}</Button>
          </div>
          <div className="content">
            {t(
              "Users can click the drop-down box to select the existing data in the database for phenotype extraction, or click upload data, scan the pop-up two-dimensional code, and upload the video through the small program. After the video is uploaded, select data from the drop-down box and click Submit, and the background can carry out 3D reconstruction. After the reconstruction is completed (generally more than 45 minutes), you can slide down the page to see the 3D model and extract the phenotype."
            )}
          </div>
        </div>
      </div>
      <div className="result_in" ref={resultRef} style={{ display: show ? "block" : "none" }}>
        {
          formal === true &&
          <div className="in">
            <input type="file" accept=".ply" onChange={handleFileUpload} />
          </div>
        }
        <div className="result">
          {
            isShowInitBox &&
            <div className='left init'>
              <div>
                <Button
                  type='primary'
                  onClick={() => { setIsShowInitBox(false); setIsShowReferBox(true); setIsShowInteractiveBox(false) }}
                >
                  {t("Automatic Extraction")}
                </Button>
              </div>
              <br />
              <div>
                <Button
                  type='primary'
                  onClick={() => { setIsShowInitBox(false); setIsShowReferBox(false); setIsShowInteractiveBox(true) }}
                >
                  {t("Interactive Extraction")}
                </Button>
              </div>
            </div>
          }
          {
            isShowReferBox &&
            <div className="left refer">
              <div className="box0">
                <List
                  style={{ backgroundColor: "rgba(240,248,255,.7)", margin: "40% 5% 20% 5%", }}
                  header={<div>{t("Reference Phenotype")}</div>}
                  bordered
                  dataSource={data}
                  renderItem={(item) => (
                    <List.Item>
                      {item}
                    </List.Item>
                  )}
                />
                <Button type='primary' onClick={(event) => { event.stopPropagation(); beginExtraction() }}>{t("Start Interactive Extraction")}</Button>
              </div>
            </div>
          }
          {isShowInteractiveBox &&
            <div className="left point">
              <div className="box box1">
                <Descriptions style={{ margin: "2%", backgroundColor: "rgb(222, 232, 240)" }} column={1} items={referInfo} />
                <Button onClick={(event) => { event.stopPropagation(); onReferChange(); }} disabled={!isReferenceSet}>{t("Select the reference again")}</Button>
                <Button onClick={onReferOK} disabled={isReferenceSet}>OK</Button>
              </div>
              <div className="box box2">

                <Descriptions style={{ margin: "2%", backgroundColor: "rgba(240,248,255,.8)" }} column={1} items={pointInfo} />

              </div>
              <div className="box box3">
                <Descriptions style={{ margin: "2%", backgroundColor: "rgba(240,248,255,.9)" }} column={1} items={leavesItem} />
                <Button onClick={onLeavesNumBegin} disabled={!isReferenceSet}>{!isCounting ? t("Start counting") : t("Stop counting")}</Button>
                <Button onClick={onLeavesNumReset} disabled={!isCounting}>{t("Reset")}</Button>
              </div>
              <Button type='primary' onClick={viewRefer}>{t("View Reference Phenotype")}</Button>
            </div>
          }

          <div className="canvas-container">
            <Canvas
              camera={{ position: [0, -3, 2] }}
              raycaster={{
                params: {
                  Mesh: {},
                  Line: { threshold: 1 },
                  LOD: {},
                  Points: { threshold: 0.005 },
                  Sprite: {}
                }
              }}
            >
              <ambientLight />
              <OrbitControls
                target={[0, 0, 0]}
                // maxPolarAngle={Math.PI}
                // minPolarAngle={-Math.PI}
                enablePan={true} // 允许平移
                enableZoom={true} // 允许缩放
                // 设置只能水平转动，不用上下转动
                maxPolarAngle={Math.PI * 4} // 最大仰角为水平位置
                minPolarAngle={-Math.PI * 4} // 最小仰角也为水平位置
              />
              {plyUrl &&
                <Model
                  plyUrl={plyUrl}
                  onSelectPoint={handleSelectPoint}
                  leavesPoints={leavesPoints}
                  selectedPoints={selectedPoints}
                  referPoint={referPoint}
                  countPoints={isCounting}
                  distancePoint={distancePoint}
                />}
              {showReferencePrompt && (
                <Html center>
                  <div style={{
                    width: "200px",
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    color: '#333'
                  }}>
                    {t("Select A Reference First")}
                  </div>
                </Html>
              )}
              {/* 计数模式/交互模式 */}
              {countingModePrompt && (
                <Html center>
                  <div style={{
                    width: "200px",
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    color: '#333'
                  }}>
                    {countingModePrompt}
                  </div>
                </Html>
              )}
            </Canvas>
          </div>
        </div>
        <div className="content">
          {t(
            "The user can obtain the distance between two points by clicking the mouse, which is a relative value, if the need to obtain the real length can be converted according to the equivalent proportion of the reference object in the three-dimensional model. Areas of expertise for accurate geometric measurements in 3D models, such as biomorphology, architectural engineering, and manufacturing, are important to support users in complex spatial data analysis and decision making."
          )}
        </div>
      </div>
    </div>
  );
};

export default PrePhenotype;
