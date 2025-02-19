import './index.scss'
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import { Menu, MenuProps, message } from 'antd';
import { useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Spin, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setToken } from '@/utils';
import { emailLoginAPI, getCodeAPI, getUserInfoAPI } from '@/apis';
import { setUser } from '@/store/user/user';
import { useDispatch } from 'react-redux';

const items = [
  {
    label: 'Home',
    key: '/',
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
  const navigate = useNavigate()
  const [current, setCurrent] = useState('mail');


  const [email, setEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [yztime, setYztime] = useState(60);
  const [isDisabled, setIsDisabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === "/") {
      console.log('click ', e);
      setCurrent(e.key);
      navigate('/')
    }
  };
  const onFinish: FormProps['onFinish'] = async (values) => {
    setLoading(true);
    console.log('Success:', values);
    // const res: resType = await loginAPI(values)

    let formData = new FormData();
    formData.append("email", email)
    formData.append("e_code", values.e_code)
    // 输出 FormData 内容
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    try {
      const response = await emailLoginAPI(formData);
      const res = response;
      console.log(res)
      if (res.status === 200) {
        message.success("Login successful!")
        console.log(res.data.token);

        setToken(res.data.token)
        dispatch(setUser(email || ''));

        // 将用户名保存到localStorage中
        try {
          const res = (await getUserInfoAPI()).data;
          if (res.code === 200) {
            localStorage.setItem('username', res.data.user.userName)
          }
        } catch (error) {
          message.error("Network connection error, please check the network and try again")
        }
        navigate('/')
      } else {
        message.error("Login failed")
      }
    } catch (error) {
      message.error("Network connection error, please check the network and try again")
    }
    setLoading(false);
  };

  

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  }
  // 定时器
  const getCode = async () => {
    console.log("发送验证码");
    console.log(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.length === 0) {
      message.error("请输入邮箱号码")
    } else if (!emailRegex.test(email)) {
      message.error("请输入有效的邮箱地址");
    } else {
      setIsDisabled(true);
      setLoadingEmail(true);
      let time = 60;
      const timer = setInterval(() => {
        time -= 1;
        setYztime(time);
        if (time <= 0) {
          clearInterval(timer);
          setIsDisabled(false);
          setLoadingEmail(false);
          setYztime(60);
        }
      }, 1000);

      const data = (await getCodeAPI(email)).data
      message.success(data)
    }
  };

  return (
    <div className='LoginEmail'>
      <Menu className='right' onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      <div className='main'>
        <div className='title'>
          Welcome back
        </div>
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
        <div className='content animate__animated animate__backInUp'>AutoGP provides a powerful genetic prediction phenotype tool for your crops. Simply provide the genome and phenotype of the material, and we will automate model training and phenotypic prediction, providing you with highly accurate results for personalized genetic analysis and phenotypic prediction.</div>
      </div>
    </div>
  )
}

export default LoginEmail