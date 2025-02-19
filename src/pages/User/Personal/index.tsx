import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { message, Button, Flex } from 'antd'
import { Badge, Descriptions, Modal, Form, Input } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import type { DescriptionsProps } from 'antd';
import { changeUserInfo, getUserInfoAPI, revisePasswordAPI } from '@/apis'
import Personaldata from '@/pages/DataManage/Components/Personaldata';
import './index.scss'
import Highquality from '@/pages/DataManage/Components/Highquality';
import ShareData from '@/pages/DataManage/Components/Sharedata';
import PhenotypeData from '@/pages/DataManage/Components/PhenotypeData';
import { tokenLoss } from '@/utils';

const Personal = () => {

  const location = useLocation();
  const pathname = location.pathname;
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const { t } = useTranslation();

  const [data, setData] = useState({
    userName: '',
    email: null,
    phonenumber: null,
    sex: null,
    id: null,
    nickName: null,
    status: null,
  });
  const formatSex = (sex) => {
    switch (sex) {
      case "1": return "男"; // Male
      case "0": return "女"; // Female
      default: return "";   // Unspecified or incorrect values
    }
  };
  const items: DescriptionsProps['items'] = [
    {
      key: 'userName',
      label: t('userName'),
      children: data.userName,
    },
    {
      key: 'id',
      label: 'id',
      children: data.id,
    },

    {
      key: 'nickName',
      label: t('nickName'),
      children: data.nickName,
    },
    {
      key: 'sex',
      label: t('性别'),
      children: formatSex(data.sex)
    },
    {
      key: 'phonenumber',
      label: t('phonenumber'),
      children: data.phonenumber,
    },
    {
      key: 'email',
      label: t('email'),
      children: data.email,
    },
    {
      key: 'status',
      label: t('status'),
      children: <Badge status="processing" text="Running" />,
      span: 3,
    },
  ];
  useEffect(() => {
    async function getData() {
      try {
        const res = (await getUserInfoAPI()).data;
        if (res.code === 200) {
          setData(res.data.user);
          console.log(res.data.user);

          form.setFieldsValue({
            email: res.data.user.email,
            sex: res.data.user.sex === "1" ? "男" : "女",
            phonenumber: res.data.user.phonenumber
          });
        } else if (res.code == 401) {
          tokenLoss(pathname);
        } else {
          message.error(res.msg)
        }
      } catch (error) {
        console.error('failed:', error);
        message.error(t("Failed to obtain personal information. Please check the network and try again or log in again."));
      }
    }
    getData();
  }, [location]);


  const handleUpdateInfo = async (values) => {
    const formData = new FormData();
    formData.append('email', values.email || "");
    if (values.sex === "男") {
      formData.append('sex', "1");
    } else {
      formData.append('sex', "0");
    }
    formData.append('phonenumber', values.phonenumber || "");
    try {
      const response = await changeUserInfo(formData);
      const res = response.data;
      console.log(res);
    } catch (error) {
      console.error('failed:', error);
      message.error(t("Failed to modify the information. Please check the network and try again."))
    }
    setIsModalOpen(false);
  };

  const handleUpdatePassword = async (values) => {
    try {
      const response = await revisePasswordAPI(values);
      const res = response.data;
      console.log(res);
    } catch (error) {
      console.error('failed:', error);
      message.error(t("Failed to change the password. Please check the network and try again!"))
    }
    setIsModalOpen2(false);
  };
  return (
    <div className='personal'>
      <div className="main">
        <div className="info">
          <div className="fun">
            <Flex gap="middle">
              <div className="changeInfo">
                <Button onClick={() => setIsModalOpen(true)}>
                  {t("Modify information")}
                </Button>
                <Modal
                  title={t("Modify basic information")}
                  open={isModalOpen}
                  onOk={() => form.submit()}
                  onCancel={() => setIsModalOpen(false)}
                  destroyOnClose
                >
                  <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 20 }}
                    onFinish={handleUpdateInfo}
                  >
                    <Form.Item label="Email" name="email"><Input defaultValue={data.email} /></Form.Item>
                    <Form.Item label="Sex" name="sex"><Input defaultValue={data.sex} /></Form.Item>
                    <Form.Item label="Phone Number" name="phonenumber"><Input defaultValue={data.phonenumber} /></Form.Item>
                  </Form>
                </Modal>
              </div>
              <div className="changePassword">
                <Button type="primary" onClick={() => setIsModalOpen2(true)}>
                  {t("Change your password")}
                </Button>
                <Modal
                  title={t("Change your password")}
                  open={isModalOpen2}
                  onOk={() => form2.submit()}
                  onCancel={() => setIsModalOpen2(false)}
                  destroyOnClose
                >
                  <Form
                    form={form2}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 20 }}
                    onFinish={handleUpdatePassword}
                  >
                    <Form.Item label={t("Please enter the username")} name="userName" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item label={t("Please enter a new password")} name="password" rules={[{ required: true }]}>
                      <Input.Password />
                    </Form.Item>
                    <Form.Item label={t("Please confirm your password")} name="passwordR" rules={[{ required: true }]}>
                      <Input.Password />
                    </Form.Item>
                  </Form>
                </Modal>
              </div>
            </Flex>
          </div>
          <Descriptions className='data' title="" bordered items={items} />
          <div className="data-personal" >
          <div className="title">
            {t("Personal databases")}
          </div>
          <Personaldata dataKey="personal" />
          <span className="Link">
            <Link
              to="/app/manage/personaldata"
              style={{ textDecoration: 'none', color: 'inherit', fontSize: '2vh' }}
            >
              {t("Find out more")} &nbsp;&gt;
            </Link>
          </span>
        </div>
        </div>
        
        <div className="data data-share">
          <div className="title">
            {t("Share databases")}
          </div>
          <ShareData dataKey="personal" />
          <span className="Link">
            <Link
              to="/app/manage/sharedata"
              style={{ textDecoration: 'none', color: 'inherit', fontSize: '2vh' }}
            >
              {t("Find out more")} &nbsp;&gt;
            </Link>
          </span>
        </div>
        <div className="data data-high">
          <div className="title">
            {t("High-quality databases")}
          </div>
          <Highquality dataKey='personal' />
          <span className="Link">
            <Link
              to="/app/manage/highquality"
              style={{ textDecoration: 'none', color: 'inherit', fontSize: '2vh' }}
            >
              {t("Find out more")} &nbsp;&gt;
            </Link>
          </span>
        </div>
        <div className="data data-phenotype">
          <div className="title">
            {t("Phenotypic databases")}
          </div>
          <PhenotypeData dataKey="personal" />
          <span className="Link">
            <Link
              to="/app/manage/phenotype"
              style={{ textDecoration: 'none', color: 'inherit', fontSize: '2vh' }}
            >
              {t("Find out more")} &nbsp;&gt;
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
};

export default Personal;