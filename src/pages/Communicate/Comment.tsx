// src/Comment.js
import CommentForm from './CommentForm';
import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons'
import './Comment.scss'

const Comment = ({ comment }) => {

  const { t } = useTranslation();
  return (
    <div className='comment' style={{ marginLeft: '20px', marginTop: '10px' }}>
      <div>
        <div className="data">
          <div className="title"><UserOutlined /> {comment.nickName} :</div>
          <div className="time">{comment.createTime}</div>
        </div>
        <div className="content">{comment.content}</div>
      </div>
      <div className="reply"><CommentForm parentCommentId={comment.commentId} /></div>
      <div className="child">
        {comment.replyComments && (
          <div className='item'>
            {comment.replyComments.map(reply => (
              <div key={reply.commentId} className="childReply">
                <div className="data">
                  <div className="title">{reply.nickName} {t('回复')} {comment.nickName} :</div>
                  <div className="time">{reply.createTime}</div>
                </div>
                <div className="content">{reply.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
