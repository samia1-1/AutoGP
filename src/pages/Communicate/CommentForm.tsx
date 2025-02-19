import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Modal, message } from 'antd';
import { publishAPI } from '@/apis';

const CommentForm = ({ parentCommentId = -1 }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');

  const { t } = useTranslation();
  const handleSubmit = async (values) => {
    console.log('Received values of form: ', values);

    const formData = new FormData();
    formData.append("content", values.content)
    formData.append("parentCommentId", parentCommentId.toString())
    const res = await (await publishAPI(formData)).data
    
    if(res.code===200){
      message.success(t("回复成功")+"!")
    }else{
      message.error(t("回复失败，请检查网络或刷新重试！"))
    }

    setOpen(false);
   
    setContent('');
  };

  return (
    <div className='CommentForm'>
      <span style={{fontSize:'1vw','color':'rgb(151, 149, 149)','cursor':'pointer'}} onClick={() => setOpen(true)}>
        {t('回复!')}
      </span>
      <Modal
        open={open}
        title={t("让大家听到你的声音!")}
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpen(false)}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={{ modifier: 'public' }}
            onFinish={(values) => handleSubmit(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
          name="content"
          label={t("回复!")}
          rules={[{ required: true, message: '请输入回复内容！' }]}
        >
          <Input onChange={(e) => setContent(e.target.value)} value={content}  />
        </Form.Item>
      </Modal>
    </div>
  );
};

export default CommentForm;