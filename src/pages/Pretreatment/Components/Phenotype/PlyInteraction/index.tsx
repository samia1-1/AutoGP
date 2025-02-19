import { useState, useRef, useEffect } from 'react';
import { Button, List, Descriptions, Input, message } from 'antd';
import { calculateDistance } from '@/utils'; // 假设这个方法在 utils 中
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import Model from './Model.tsx'; // 引入 Model 组件
import { useTranslation } from 'react-i18next';
import './index.scss';

const PlyInteraction = ({
  show,
  plyUrl,
  setPlyUrl,
  referPheno,
}) => {
  const { t } = useTranslation();
  const resultRef = useRef(null);

  const [formal] = useState(false);   // 为false渲染上传文件按钮（测试ply文件用）
  // 控制交互界面
  const [isShowInitBox, setIsShowInitBox] = useState(true);    // 初始界面（两个按钮：自动提取/交互提取）
  const [isShowReferBox, setIsShowReferBox] = useState(false);   // 是否显示参考表型
  const [isShowInteractiveBox, setIsShowInteractiveBox] = useState(false)    // 是否显示交互提取

  const [selectedPoints, setSelectedPoints] = useState([]);
  const [distance, setDistance] = useState(null);

  const [distancePoint, setDistancePoint] = useState([]);    // 两个计算距离的点
  const [leavesPoints, setLeavesPoints] = useState([]); // 用于存储叶子点

  const [isReferenceSet, setIsReferenceSet] = useState(false);  // 参照物ok
  const [showReferencePrompt, setShowReferencePrompt] = useState(false);   // 弹出指示：选择参照物
  const [referPoint, setReferPoint] = useState([]);  // 保存参照物的点

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

  useEffect(() => {
    if (selectedPoints.length === 2) {
      const dist = calculateDistance(selectedPoints[0], selectedPoints[1]);
      setDistance(dist);
    }
  }, [selectedPoints, isReferenceSet]);

  // 参考表型
  const data = [
    `height: ${referPheno.height}`,
  `leaveNum: ${referPheno.leaveNum}`,
  `angle:${referPheno.angle}`
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



  // 进行左右旋转
  const [rotation, setRotation] = useState(0); // 添加旋转状态

  const handleRotateLeft = () => {
    setRotation((prev) => prev - Math.PI / 18); // 左旋转
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + Math.PI / 18); // 右旋转
  };

  return (

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
            <div className="before">
              <span
                style={{ textAlign: "left", left: 0 }}
                onClick={() => { setIsShowInitBox(true); setIsShowReferBox(false); setIsShowInteractiveBox(false) }}
              >&lt; {t("Back")}</span>
            </div>
            <div className="box0">
              <List
                style={{ backgroundColor: "rgba(240,248,255,.7)", margin: "30px 8%", }}
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
            <div className="before">
              <span
                style={{ textAlign: "left", left: 0 }}
                onClick={() => { setIsShowInitBox(true); setIsShowReferBox(false); setIsShowInteractiveBox(false) }}
              >&lt; {t("Back")}</span>
            </div>
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

        {/* 左右旋转按钮 */}
        <div className='rotate_button button_1'>
          <Button onClick={handleRotateLeft}>&lt;</Button>
        </div>
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
                rotation={rotation}
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
        <div className='rotate_button button_2'>
          <Button onClick={handleRotateRight}>&gt;</Button>
        </div>
      </div>
      <div className="content">
        {t(
          "The user can obtain the distance between two points by clicking the mouse, which is a relative value, if the need to obtain the real length can be converted according to the equivalent proportion of the reference object in the three-dimensional model. Areas of expertise for accurate geometric measurements in 3D models, such as biomorphology, architectural engineering, and manufacturing, are important to support users in complex spatial data analysis and decision making."
        )}
      </div>
    </div>
  );
};

export default PlyInteraction;