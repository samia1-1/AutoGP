import {
  AppstoreOutlined,
  HomeOutlined,
  ProductOutlined,
  ControlOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Menu, message, Select, Space,Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { removeToken } from "@/utils";
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import './index.scss'


const TopBar = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const items: MenuProps['items'] = [
    {
      label: t('Home'),
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: t('Database'),
      key: '/app/manage',
      icon: <DatabaseOutlined />,
      children: [
        {
          label: t('Personal databases'),
          key: '/app/manage/personaldata'
        },
        {
          label: t('Share databases'),
          key: '/app/manage/sharedata'
        },
        {
          label: t('High-quality databases'),
          key: '/app/manage/highquality'
        },
        {
          label: t('Phenotypic databases'),
          key: '/app/manage/phenotype'
        },
      ]
      // disabled: true,
    },
    {
      label: t('Preprocessing'),
      key: '/app/pretreatment',
      icon: <ControlOutlined />,
      children: [
        {
          label: t('Phenotype extraction'),
          key: '/app/pretreatment/phenotype_extraction',
        },
        {
          label: t('High-Quality SNPs Extraction'),
          key: '/app/pretreatment/gene_extraction',
        }
      ]
    },
    {
      label: t('Data Analysis'),
      key: '/app/analysis',
      icon: <AppstoreOutlined />,
      children: [
        {
          label: t("Population division"),
          key: '/app/analysis/group',
        },
        {
          label: t("Phenotypic data analysis"),
          key: '/app/analysis/phenotype',
        },
        {
          label: t("GWAS analysis"),
          key: '/app/analysis/gwas',
        },
      ]
    },
    {
      label: t('Genomic Selection'),
      key: '/app/select',
      icon: <ProductOutlined />,
      children: [
        {
          label: t('Model training'),
          key: '/app/select/train'
        },
        {
          label: t('Phenotypic prediction'),
          key: '/app/select/predict'
        },
        {
          label: t('Integrated training and prediction'),
          key: '/app/select/combine'
        },
        {
          label: t('Selection of optimal parents'),
          key: '/app/select/optimal'
        },
        {
          label: t('Integrated training and selection'),
          key: '/app/select/train_optimal'
        },
      ],
    },
    // {
    //   label: t('互动交流'),
    //   key: 'communicate',
    //   icon: <CommentOutlined />,
    // },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    navigate(`${e.key}`);
  };

  const languageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
    localStorage.setItem('i18nextLng', value);
  };

  
  const confirmLogout = () => {
    Modal.confirm({
      title: t('Confirm exit'),
      content: 'Are you sure you want to log out?',
      onOk() {
        message.success('Log out successfully!');
        removeToken();
        localStorage.clear()
        navigate('/login');
      },
      onCancel() {
        console.log('Cancel logout');
      },
    });
  };

  return (

    <div className='top_bar'>
      <div className='middle'>
        <Menu
          className='ant-menu'
          onClick={onClick}
          mode="horizontal"
          items={items}
        />
      </div>
      <div className='language'>
        <Space wrap>
          <Select
            defaultValue={localStorage.getItem('language') || "English"}
            style={{ width: 120 }}
            onChange={languageChange}
            options={[
              { value: 'zh', label: '中文' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Space>
        <span style={{padding:"0 30px"}}>|</span>
        <span className='personal item' onClick={()=>{navigate('/app/personal')}}><UserOutlined /></span>
        <span className='logout item' style={{"paddingLeft":"30px"}} onClick={confirmLogout}><LogoutOutlined /></span>
      </div>
    </div>
  );
};

export default TopBar;
