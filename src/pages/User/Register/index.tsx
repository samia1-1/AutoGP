import './index.scss'
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import { Menu, MenuProps, message } from 'antd';

import { useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCodeAPI, registerAPI } from '@/apis';

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

const Register = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('mail');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [yztime, setYztime] = useState(60);
  const [isDisabled, setIsDisabled] = useState(false);

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === "/") {
      console.log('click ', e);
      setCurrent(e.key);
      navigate('/');
    }
  };

  const onFinish: FormProps['onFinish'] = async (values) => {
    if (values.password !== values.passwordR) {
      message.error("两次输入密码不一致");
    } else {
      console.log('Success:', values);

      let formData = new FormData();
      formData.append("email", email)
      formData.append("e_code", values.e_code)
      formData.append("userName", values.userName)
      formData.append("password", values.password)
      formData.append("passwordR", values.passwordR)
      // 输出 FormData 内容
      console.log("邮箱注册 接口传递参数：");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      try {
        const res = await registerAPI({
          "email": email,
          "eCode": values.e_code,
          "userName": values.userName,
          "password": values.password,
          "passwordR": values.passwordR,
        });
        const data = res.data;
        console.log('Registration successful:', res.data);
        if (data.code !== 200) {
          message.error(data.msg);
        } else {
          message.success("注册成功！");
          navigate('/login');
        }
      } catch (error) {
        console.error('Registration failed:', error);
        message.error("注册失败，请检查输入或稍后重试。");
      }
    }
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
      setLoading(true);
      let time = 60;
      const timer = setInterval(() => {
        time -= 1;
        setYztime(time);
        if (time <= 0) {
          clearInterval(timer);
          setIsDisabled(false);
          setLoading(false);
          setYztime(60);
        }
      }, 1000);

      const data = (await getCodeAPI(email)).data
      console.log(data);

    }
  };

  return (
    <div className='register'>
      <Menu className='right' onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      <div className='main'>
        <div className='title animate__animated animate__backInDown'>
          Create an account
        </div>
        <div className='login  animate__animated animate__backInUp'>
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
                    loading={loading}
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
              label="Verification code"
              name="e_code"
              rules={[{ required: true, message: 'Please input the verification code!' }]}
            >
              <Input placeholder='Please enter the verification code' />
            </Form.Item>

            <Form.Item
              label="Usename"
              name="userName"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input placeholder='Please enter a username' />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm password"
              name="passwordR"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Sign up
              </Button>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button style={{ color: 'white', fontSize: '2vh' }} type="link" onClick={() => navigate('/login')}>
                If you already have an account, sign in! &gt;
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* <div className='content animate__animated animate__backInUp'>AutoGP provides a powerful genetic prediction phenotype tool for your crops. Simply provide the genome and phenotype of the material, and we will automate model training and phenotypic prediction, providing you with highly accurate results for personalized genetic analysis and phenotypic prediction.</div> */}
      </div>
    </div>
  );
}

export default Register;
