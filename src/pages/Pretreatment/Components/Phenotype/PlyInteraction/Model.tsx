import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { useEffect } from 'react';
const Model = ({ plyUrl, onSelectPoint, leavesPoints, selectedPoints, referPoint, countPoints, distancePoint,rotation }) => {
  const plyGeometry = useLoader(PLYLoader, plyUrl);

  // 如果加载成功后处理 geometry
  useEffect(() => {
    if (plyGeometry) {
      const geometry = Array.isArray(plyGeometry) ? plyGeometry[0] : plyGeometry;

      if (geometry.attributes.position) {
        // 获取 position 数组
        const positions = geometry.attributes.position.array;

        // 检查是否包含非法值
        let hasNaN = false;
        for (let i = 0; i < positions.length; i++) {
          if (isNaN(positions[i])) {
            hasNaN = true;
            break;
          }
        }

        if (hasNaN) {
          console.error('Geometry contains NaN values in position attribute.');
          // 清理非法值，将 NaN 替换为 0
          const cleanedPositions = positions.map((value) => (isNaN(value) ? 0 : value));
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(cleanedPositions, 3));
        }

        // 重新计算边界和法线
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();
      } else {
        console.error('Geometry has no position attribute.');
      }
    }
  }, [plyGeometry]);

  // 材质设置
  const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
  // 检查 plyGeometry 是否是数组，如果是则使用第一个元素
  const geometry = Array.isArray(plyGeometry) ? plyGeometry[0] : plyGeometry;
  const points = new THREE.Points(geometry, material);

  const handlePointerDown = (event) => {
    if (event.intersections.length > 0) {
      const { point } = event.intersections[0];
      console.log('Clicked point:', point);
      onSelectPoint(point);
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