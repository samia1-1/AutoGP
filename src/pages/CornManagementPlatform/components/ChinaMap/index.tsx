import { startTransition, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import  geoJson  from './geoJsonDatabase.json'; 

import './index.scss'

const provinceNameMap = {
  北京市: 'BeiJing',
  天津市: 'TianJin',
  上海市: 'ShangHai',
  重庆市: 'ChongQing',
  河北省: 'HeBei',
  山西省: 'ShanXi',
  辽宁省: 'LiaoNing',
  吉林省: 'JiLin',
  黑龙江省: 'HeiLongJiang',
  江苏省: 'JiangSu',
  浙江省: 'ZheJiang',
  安徽省: 'AnHui',
  福建省: 'FuJian',
  江西省: 'JiangXi',
  山东省: 'ShanDong',
  河南省: 'HeNan',
  湖北省: 'HuBei',
  湖南省: 'HuNan',
  广东省: 'GuangDong',
  海南省: 'HaiNan',
  四川省: 'SiChuan',
  贵州省: 'GuiZhou',
  云南省: 'YunNan',
  陕西省: 'ShaanXi',
  甘肃省: 'GanSu',
  青海省: 'QingHai',
  台湾省: 'TaiWan',
  内蒙古自治区: 'Inner Mongolia',
  广西壮族自治区: 'GuangXi',
  西藏自治区: 'Tibet',
  宁夏回族自治区: 'NingXia',
  新疆维吾尔自治区: 'XinJiang',
  香港特别行政区: 'Hong Kong',
  澳门特别行政区: 'Macau',
};


const ChinaMap = () => {
  const navigate = useNavigate();
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    setGeoJsonData(geoJson); 
    echarts.registerMap('china', JSON.stringify(geoJson)); 
  }, []);

  const option = {
    title: {
      subtext: '',
      left: 'center',
      textStyle: {
        fontSize: 20,
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}', // 显示省份名称
    },
    series: [
      {
        name: '省份',
        type: 'map',
        map: 'china',
        zoom: 1.5,
        center: [105, 38],
        label: {
          show: true,
          color: '#808080',
        },
        itemStyle: {
          normal: {
            areaColor: 'rgb(181, 200, 254)',
            borderColor: '#fff',
            borderWidth: 1,
          },
          emphasis: {
            areaColor: '#ff6666',
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
        data: [
          { name: '北京市', value: Math.random() * 1000 },
          { name: '上海市', value: Math.random() * 1000 },
          { name: '广东省', value: Math.random() * 1000 },
        ],
      },
    ],
  };

  const handleMapClick = (params) => {
    if (params.name) {
      console.log(params.name);
    }
  };

  const handleMapDoubleClick = (params) => {
    if (params.name) {
      console.log('双击的省份:', params.name);
      const englishName = provinceNameMap[params.name] || params.name; // 获取英文名，找不到时用原名
      startTransition(() => {
        navigate(`/cimp/province_detail?province=${englishName}`,{
          state: {
            chineseName: params.name, // 中文名
            englishName: englishName, // 英文名
          },
        });
      });
    }
  };

  return (
    <div className="china_map">
      <div
        className='mao'
        style={{
          width: '100vw',
          height: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '5vh',
        }}
      >
        {geoJsonData ? (
          <ReactECharts
            option={option}
            style={{ width: '100%', height: '100%' }}
            onEvents={{
              click: handleMapClick,
              dblclick: handleMapDoubleClick,
            }}
          />
        ) : (
          <div>地图加载中...</div>
        )}
      </div>
    </div>
  );
};

export default ChinaMap;
