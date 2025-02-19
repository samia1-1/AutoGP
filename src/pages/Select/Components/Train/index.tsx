import { message, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { getMulitTrainRecord, getTrainRecord } from '@/apis';

import SingleTrainRecord from './SingleAreaTrain/SingleTrainRecord.tsx';
import { tokenLoss } from '@/utils/user.tsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import MulitTrainRecord from './MulitAreaTrain/MulitTrainRecord.tsx';
const Train = () => {
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSingleArea, setIsSingleArea] = useState(false);
  const [isMulitArea, setIsMulitArea] = useState(false);

  const [singleRecord, setSingleRecord] = useState([]);
  const [mulitRecord, setMulitRecord] = useState([]);

  const location = useLocation();
  useEffect(() => {
    const pathname = location.pathname.split('/')[4]
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
        const res = (await getTrainRecord()).data;
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
        const res = await getMulitTrainRecord();
        if (res.code == 200) {
          setMulitRecord(res.data)
        }
      } catch (error) {
        throw error;
      }
    }
    getData();
  }, []);

  return (
    <div className='train'>
      <div className='header'>
        <div className='title'>{t('Model training')}</div>
        <div className='content'>
          {t(
            "Use cutting-edge machine learning and deep learning algorithms! Simply enter the genetic and phenotypic data, select the model you want, and the platform will automatically train the model for you to achieve an efficient prediction process. You'll have accurate predictions at your fingertips to inform your research and decision-making process."
          )}
        </div>
      </div>
      <div className="container">
        <div className='func'>
          <div className="train_type">
            {/* <div
              className={isSingleArea ? 'single active' : 'single'}
              onClick={() => { setIsSingleArea(true); setIsMulitArea(false);navigate('/app/select/train/single_area') }}
            >
              {t("Single Area")}
            </div>
            <div
              className={isMulitArea ? 'mulit active' : 'mulit'}
              onClick={() => { setIsSingleArea(false); setIsMulitArea(true);navigate('/app/select/train/mulit_area')}}
            >
              {t("Multi-area")}
            </div> */}
            {
              pathname === '/app/select/train/single_area' &&
              <Button
                className={isMulitArea ? 'mulit active' : 'single'}
                onClick={() => { setIsSingleArea(false); setIsMulitArea(true); navigate('/app/select/train/mulit_area') }}
              >
                {t("Add Environmental Information")}
              </Button>
            }
            {
              pathname === '/app/select/train/mulit_area' &&
              <Button
                className={isSingleArea ? 'single active' : 'mulit'}
                onClick={() => { setIsSingleArea(true); setIsMulitArea(false); navigate('/app/select/train/single_area') }}
              >
                {t("Cancel Environmental Information")}
              </Button>
            }
          </div>
          <div className="add_env_data">
          </div>
          <Outlet />
        </div>
        <div className="divider"></div>
        {
          pathname === '/app/select/train/single_area' &&
          <div className='history'>
            <div className='title'>{t('Model training Records')}</div>
            <SingleTrainRecord records={singleRecord} />
          </div>
        }
        {
          pathname === '/app/select/train/mulit_area' &&
          <div className='history'>
            <div className='title'>{t('多地区训练记录')}</div>
            {/* <Record records={record} /> */}
            <MulitTrainRecord records={mulitRecord} />
          </div>
        }
      </div>
    </div>
  );
};

export default Train;
