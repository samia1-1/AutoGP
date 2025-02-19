import './index.scss'
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons';
import { Menu, MenuProps, message } from 'antd';
import { useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { setToken } from '@/utils';
import { loginAPI } from '@/apis';
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

const Login = () => {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('mail');

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key === "/") {
      console.log('click ', e);
      setCurrent(e.key);
      navigate(e.key)
    }
  };
  const onFinish: FormProps['onFinish'] = async (values) => {
    setLoading(true);
    console.log('Success:', values);
    // const res: resType = await loginAPI(values)
    try {
      const response = await loginAPI(values);
      const res = response.data;
      console.log(res)
      if (res.code === 200) {
        message.success("Login successful!")
        console.log(res.data.token);

        setToken(res.data.token)
        dispatch(setUser(values.username)); // 保存用户名到Redux store

        localStorage.setItem('username', values.userName)
        localStorage.setItem('language', 'en')
        localStorage.setItem('i18nextLng', 'en')
        if(localStorage.getItem("pathname")){
          navigate(localStorage.getItem("pathname"))
        }else{
          navigate('/')
        }
      } else {
        message.error("Wrong username or password")
      }
    } catch (error) {
      message.error("Login failed, please check the input or try again later.")
    }
    console.log("login")
    setLoading(false);
  };
  return (
    <div className='Login'>
      <Menu className='right' onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      <div className='main'>
        <div className='title animate__animated animate__backInDown'>
        Welcome back
        </div>
        <div className='login animate__animated animate__backInUp'>
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
              label="Usename"
              name="userName"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              className="myPassword"
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                {loading && <Spin style={{ color: "white", marginRight: "4vh", }} />}
                Sign in
              </Button>
            </Form.Item>
            <Form.Item>
              <Button style={{ color: 'white', fontSize: '2vh' }} type="link" onClick={() => navigate('/email_login')}>
                Sign in with your email address! &gt;
              </Button>
            </Form.Item>
            <Form.Item>
              <Button style={{ color: 'white', fontSize: '2vh' }} type="link" onClick={() => navigate('/register')}>
                Don't have an account? Sign up! &gt;
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="test animate__animated animate__backInUp">
          <div>test account1: &nbsp;usename: anylize, password: 123456</div>
          <div>test account2: &nbsp;usename: YaP, password: 123456</div>
        </div>
        {/* <div className='content animate__animated animate__backInUp'>AutoGP provides a powerful genetic prediction phenotype tool for your crops. Simply provide the genome and phenotype of the material, and we will automate model training and phenotypic prediction, providing you with highly accurate results for personalized genetic analysis and phenotypic prediction.</div> */}
      </div>
    </div>
  )
}

export default Login