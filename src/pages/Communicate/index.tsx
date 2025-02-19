import { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import CommentList from './CommentList.tsx';
import TopBar from '@/components/TopBar';
import './index.scss';
import { message } from 'antd';
import { getCommentAPI, publishAPI } from '@/apis/comment.tsx';

const initData = [
  {
    "commentId": 1,
    "nickName": "anylize",
    "email": null,
    "content": "666",
    "avatar": null,
    "createTime": "2024-06-26T13:38:08.000+00:00",
    "parentCommentId": -1,
    "replyComments": [
      {
        "commentId": 3,
        "nickName": "anylize",
        "email": null,
        "content": "888",
        "avatar": null,
        "createTime": "2024-06-26T13:38:08.000+00:00",
        "parentCommentId": 1,
        "replyComments": [],
        "parentComment": null,
        "parentNickname": null,
        "userId": 2
      }
    ],
    "parentComment": null,
    "parentNickname": null,
    "userId": 1
  },
  {
    "commentId": 2,
    "nickName": "anylize",
    "email": null,
    "content": "777",
    "avatar": null,
    "createTime": "2024-06-26T13:38:08.000+00:00",
    "parentCommentId": -1,
    "replyComments": [
      {
        "commentId": 4,
        "nickName": "anylize",
        "email": null,
        "content": "999",
        "avatar": null,
        "createTime": "2024-05-02T17:46:16.000+00:00",
        "parentCommentId": 2,
        "replyComments": [],
        "parentComment": null,
        "parentNickname": null,
        "userId": 3
      }
    ],
    "parentComment": null,
    "parentNickname": null,
    "userId": 1
  }
]

const Communicate = () => {
  const [comments, setComments] = useState(initData);
  // const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  const { t } = useTranslation();
  useEffect(() => {
    async function getData() {
      try {
        const res = (await getCommentAPI()).data;
        if (res.code === 200) {
          setComments(res.data);
          console.log(res);
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error('failed:', error);
        message.error(t("获取数据失败，请检查网络或稍后重试!"));
      }
    }
    getData()
    console.log("useEffect获取评论")
  }, [])
  const add = async () => {
    console.log("发布评论", commentInput);

    if (commentInput.length===0) {
      message.error(t("请输入评论内容!"))
      return;
    } else {
      const formData = new FormData();
      formData.append('content', commentInput);
      formData.append('parentCommentId', "-1");
      try {
        const res = (await publishAPI(formData)).data;
        if (res.code === 200) {
          console.log(res);
          message.success(t("发布成功"));
          setComments(comments => [
            {
              "commentId": 1,
              "nickName": null,
              "email": null,
              "content": commentInput,
              "avatar": null,
              "createTime": null,
              "parentCommentId": -1,
              "replyComments": [],
              "parentComment": null,
              "parentNickname": null,
              "userId": 1
            },
            ...comments
          ]);
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error('failed:', error);
        message.error("获取数据失败，请检查网络或稍后重试。");
      }
      setCommentInput('');
    }
  }

  return (
    <div className="Communicate">
      <TopBar/>
      <div className="main">
        <CommentList comments={comments} />
        <div className="publish">
          <Form onFinish={add} name="validateOnly" autoComplete="off" >
            <Form.Item label={t("留下你的想法吧！")} rules={[{ required: true }]}>
              <Input value={commentInput} onChange={e => setCommentInput(e.target.value)} />
              <Button type="primary" htmlType="submit">{t('发布')}</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
export default Communicate;
