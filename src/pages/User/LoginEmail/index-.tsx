import './index.scss';
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import { Menu, MenuProps, message } from 'antd';
import { useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Spin, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setToken } from '@/utils';
import { emailLoginAPI, getUserInfoAPI } from '@/apis';
import { setUser } from '@/store/user/user';
import { useDispatch } from 'react-redux';
import useEmailVerification from '@/hooks/useEmailVerification';

const items = [
  {
    label: 'Home',
    key: 'home',
    icon: <AppstoreOutlined />,
  },
  {
    label: (
      <a href="/pdfs/AutoGP帮助文档.pdf" target="_blank" rel="noopener noreferrer">
        About AutoGP
      </a>
    ),
    key: 'alipay',
    icon: <MailOutlined />,
  },
];

const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const LoginEmail = () => {
  const {
    email,
    loadingEmail,
    yztime,
    isDisabled,
    handleInputChange,
    getCode,
  } = useEmailVerification();
  
  const navigate = useNavigate();
  const [current, setCurrent] = useState('mail');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === "home") {
      console.log('click ', e);
      setCurrent(e.key);
      navigate('/' + e.key);
    }
  };

  const onFinish: FormProps['onFinish'] = async (values) => {
    setLoading(true);
    
    let formData = new FormData();
    formData.append("email", email);
    formData.append("e_code", values.e_code);

    try {
      const response = await emailLoginAPI(formData);
      if (response.status === 200) {
        message.success("Login successful!");
        setToken(response.data.token);
        dispatch(setUser(email || ''));

        const userInfoRes = (await getUserInfoAPI()).data;
        if (userInfoRes.code === 200) {
          localStorage.setItem('username', userInfoRes.data.user.userName);
        }
        navigate('/home');
      } else {
        message.error("Login failed");
      }
    } catch (error) {
      message.error("Login failed, please check the input or try again later.");
    }
    setLoading(false);
  };

  return (
    <div className='LoginEmail'>
      <Menu className='right' onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      <div className='main'>
        <div className='title'>AutoGP</div>
        <div className='login animate__animated animate__backInUp'>
          <Form
            name="code"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}>
              <Row gutter={8}>
                <Col span={16}>
                  <Input onChange={handleInputChange} value={email} placeholder='Please enter your email address' />
                </Col>
                <Col span={8}>
                  <Button
                    loading={loadingEmail}
                    onClick={getCode}
                    style={{ color: "black", width: "100%", fontSize: "14px", opacity: isDisabled ? "1" : "0.3" }}
                    type="dashed"
                    disabled={isDisabled}
                  >
                    {isDisabled ? `${yztime}s` : 'Get code'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              className="myPassword"
              label="Verification code"
              name="e_code"
              rules={[{ required: true, message: 'Please input your verification code!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                {loading && <Spin style={{ color: "white", marginRight: "4vh", }} />}
                Sign in
              </Button>
            </Form.Item>
            <Form.Item>
              <Button style={{ color: 'white', fontSize: '2vh' }} type="link" onClick={() => navigate('/login')}>
                Log in with your account and password! &gt;
              </Button>
            </Form.Item>
            <Form.Item>
              <Button style={{ color: 'white', fontSize: '2vh' }} type="link" onClick={() => navigate('/register')}>
                Don't have an account? Sign up! &gt;
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className='content animate__animated animate__backInUp'>
          AutoGP provides a powerful genetic prediction phenotype tool for your crops. Simply provide the genome and phenotype of the material, and we will automate model training and phenotypic prediction, providing you with highly accurate results for personalized genetic analysis and phenotypic prediction.
        </div>
      </div>
    </div>
  );
};

export default LoginEmail;
