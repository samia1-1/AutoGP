import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
const Model = ({ plyUrl, onSelectPoint, leavesPoints, selectedPoints, referPoint, countPoints, distancePoint,rotation }) => {
  const plyGeometry = useLoader(PLYLoader, plyUrl);

  // 检查 plyGeometry 是否是数组，如果是则使用第一个元素
  const geometry = Array.isArray(plyGeometry) ? plyGeometry[0] : plyGeometry;

  const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
  const points = new THREE.Points(geometry, material);
  // 将模型移动到中心
  // const box = new THREE.Box3().setFromObject(points);
  // const center = box.getCenter(new THREE.Vector3());
  // points.position.sub(center);


  // 计算模型的边界框，然后将模型向下移动一段距离
  const box = new THREE.Box3().setFromObject(points);
  const center = box.getCenter(new THREE.Vector3());
  const offset = 0; // 向下移动的距离，可以根据需要调整
  points.position.set(-center.x, -center.y - offset, -center.z); // 设置位置，向下移动


  // 放大模型
  // const scale = 1; // 设置缩放因子，可以根据需要调整
  // points.scale.set(scale, scale, scale); // 放大模型

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
        rotation={[0, 0, rotation]} // 使用传递的旋转角度
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

export default Model;