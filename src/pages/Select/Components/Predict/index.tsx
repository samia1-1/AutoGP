import { message, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { getMulitPredictRecord, getPredictRecord } from '@/apis';
import SinglePredictRecord from './SingleAreaPredict/SinglePredictRecord';
import { tokenLoss } from '@/utils';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import MulitPredictRecord from './MulitAreaPredict/MulitPredictRecord';

const Predict = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [singleRecord, setSingleRecord] = useState([]);
  const [mulitRecord, setMulitRecord] = useState([]);

  const [isSingleArea, setIsSingleArea] = useState(false);
  const [isMulitArea, setIsMulitArea] = useState(false);

  const location = useLocation();
  useEffect(() => {
    const pathname = location.pathname.split('/')[4]
    console.log(pathname);

    if (pathname === 'single_area') {
      setIsSingleArea(true);
      setIsMulitArea(false)
    } else {
      setIsSingleArea(false);
      setIsMulitArea(true)
    }
  }, [location])
  useEffect(() => {
    async function getData() {
      try {
        const res = (await getPredictRecord()).data;
        if (res.code === 200) {
          setSingleRecord(res.data);
        } else if (res.code == 401) {
          tokenLoss(pathname);
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        throw error;
      }
      try {
        const res = await getMulitPredictRecord();
        if (res.code == 200) {
          setMulitRecord(res.data);
        }
      } catch (error) {
        throw error;
      }
    }
    getData();
  }, []);


  return (
    <div className='predict'>
      <div className='header'>
        <div className='title'>{t('Phenotypic prediction')}</div>
        <div className='content'>{t('Before making phenotypic predictions, be sure to get the model weights file from model training. Then, upload the VCF file and model weight file of the crop to be predicted, and you can easily complete phenotypic prediction and get accurate results.')}</div>
      </div>
      <div className="container">
        <div className='func'>
          <div className="train_type">

            {
              pathname === '/app/select/predict/single_area' &&
              <Button
                className={isMulitArea ? 'mulit active' : 'single'}
                onClick={() => { setIsSingleArea(false); setIsMulitArea(true); navigate('/app/select/predict/mulit_area') }}
              >
                {t("Add Environmental Information")}
              </Button>
            }
            {
              pathname === '/app/select/predict/mulit_area' &&
              <Button
                className={isSingleArea ? 'single active' : 'mulit'}
                onClick={() => { setIsSingleArea(true); setIsMulitArea(false); navigate('/app/select/predict/single_area') }}
              >
                {t("Cancel Environmental Information")}
              </Button>
            }
          </div>
          <Outlet />
        </div>
        <div className="divider"></div>
        {pathname === '/app/select/predict/single_area' &&
          <div className='history'>
            <div className='title'>{t('Phenotypic prediction history')}</div>
            <SinglePredictRecord records={singleRecord} />
          </div>
        }
        {pathname === '/app/select/predict/mulit_area' &&
          <div className='history'>
            <div className='title'>{t('Phenotypic prediction history')}</div>
            <MulitPredictRecord records={mulitRecord} />
          </div>
        }
      </div>
    </div>
  );
}

export default Predict;
