import { message,Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { getCombineRecord, getMulitCombineRecord} from '@/apis';
import SingleCombineReocrd from './SingleAreaCombine/SingleCombineRecord';
import MulitCombineReocrd from './MulitAreaCombine/MulitCombineRecord';
import { CombineDataType } from '@/types';
import { tokenLoss } from '@/utils';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Combine = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isSingleArea, setIsSingleArea] = useState(false);
  const [isMulitArea, setIsMulitArea] = useState(false);

  const [record, setRecord] = useState<CombineDataType[]>([]);
  const [mulitRecord, setMulitRecord] = useState([]);

  const location = useLocation();
  useEffect(()=>{
    const pathname = location.pathname.split('/')[4]
    if(pathname==='single_area'){
      setIsSingleArea(true);
      setIsMulitArea(false)
    }else{
      setIsSingleArea(false);
      setIsMulitArea(true)
    }
  },[location])
  useEffect(() => {
    async function fetchData() {
      const res = (await getCombineRecord()).data;
      if (res.code === 200) {
        setRecord(res.data);
      } else if(res.code==401){
        tokenLoss(pathname);
      }else {
        message.error(res.msg);
      }
      try {
        const res = await getMulitCombineRecord();
        if (res.code == 200) {
          setMulitRecord(res.data)
        }
      } catch (error) {
        throw error;
      }
    }
    fetchData();
  }, []);


  return (
    <div className='combine'>
      <div className='header'>
        <div className='title'>{t('Integrated training and prediction')}</div>
        <div className='content'>{t('By combining the training of machine learning models with the prediction of genetic phenotypes, the accuracy and efficiency of genetic trait prediction can be improved.')}</div>
      </div>
      <div className='container'>
        <div className='func'>
          
        <div className="train_type">
            {
              pathname === '/app/select/combine/single_area' &&
              <Button
                className={isMulitArea ? 'mulit active' : 'single'}
                onClick={() => { setIsSingleArea(false); setIsMulitArea(true); navigate('/app/select/combine/mulit_area') }}
              >
                {t("Add Environmental Information")}
              </Button>
            }
            {
              pathname === '/app/select/combine/mulit_area' &&
              <Button
                className={isSingleArea ? 'single active' : 'mulit'}
                onClick={() => { setIsSingleArea(true); setIsMulitArea(false); navigate('/app/select/combine/single_area') }}
              >
                {t("Cancel Environmental Information")}
              </Button>
            }
          </div>
          <Outlet />
        </div>
        <div className="divider"></div>
        
        {pathname === '/app/select/combine/single_area' &&
          <div className='history'>
            <div className='title'>{t('Phenotypic prediction history')}</div>
            <SingleCombineReocrd records={record} />
          </div>
        }
        {pathname === '/app/select/combine/mulit_area' &&
          <div className='history'>
            <div className='title'>{t('Phenotypic prediction history')}</div>
            <MulitCombineReocrd records={mulitRecord} />
          </div>
        }
      </div>
    </div>
  );
};

export default Combine;
