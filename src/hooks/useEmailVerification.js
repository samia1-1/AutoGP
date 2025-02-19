import { useState } from 'react';
import { message } from 'antd';
import { getCodeAPI } from '@/apis';

const useEmailVerification = (initialEmail = '') => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [yztime, setYztime] = useState(60);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const getCode = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.length === 0) {
      message.error("请输入邮箱号码");
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

      try {
        const data = (await getCodeAPI(email)).data;
        message.success(data);
      } catch (error) {
        message.error("验证码发送失败，请重试");
      }
    }
  };

  return {
    email,
    loading,
    yztime,
    isDisabled,
    handleInputChange,
    getCode,
  };
};

export default useEmailVerification;
