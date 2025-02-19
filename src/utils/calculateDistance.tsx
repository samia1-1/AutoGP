import * as THREE from 'three';

export const calculateDistance = (point1, point2) => {
  const v1 = new THREE.Vector3(point1.x, point1.y, point1.z);
  const v2 = new THREE.Vector3(point2.x, point2.y, point2.z);
  return v1.distanceTo(v2);
};
