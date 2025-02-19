import PlyInteraction from "@/pages/Pretreatment/Components/Phenotype/PlyInteraction"
import { useEffect, useState } from "react"
import './index.scss'
import { useLocation, useSearchParams } from "react-router-dom"
import { getVideoOrObjAPI } from "@/apis"
import { message } from "antd"
import { useTranslation } from "react-i18next"
import RouteLoading from "@/components/RouteLoading"

const cleanPlyData = (data) => {
  return data.replace(/nan/g, "0"); // 将所有 `nan` 替换为 `0`
};

const PlyDetail = () => {
  const { t } = useTranslation();
  const [plyUrl, setPlyUrl] = useState(null)
  // const {url} = useParams()
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  useEffect(() => {
    loadingPly();
    setPlyUrl(url)
  }, [])

  const location = useLocation();

  // 获取 URL 中的查询参数
  const queryParams = new URLSearchParams(location.search);
  const plypath = queryParams.get('url'); // 获取 plyPath 参数值
  const loadingPly = async () => {
    console.log("点云路径2:",plypath);
    // 展示 ply 文件
    try {
      message.success(t("Committed, loading... Please don't leave!"));
      const filePath = plypath; 
      const data = await getVideoOrObjAPI(filePath);
      let response = typeof data === 'string' ? data : JSON.stringify(data);
      response = cleanPlyData(response); // 清除 `nan` 值
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      console.log(url);
      
      setPlyUrl(url);
      message.success(t("The model was successfully extracted!"));
    } catch (error) {
      console.error(error);
      message.error(t("The model file does not exist!"));
    }
  }

  return (
    <div className="ply_detail">
      {plyUrl!==null ? <PlyInteraction
        show={true}
        plyUrl={plyUrl}
        setPlyUrl={setPlyUrl}
        referPheno={{ height: 0, leaveNum: 0, angle: 0 }}
      /> :
        <RouteLoading />}
    </div>
  )
}
export default PlyDetail