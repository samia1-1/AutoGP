import Comment from './Comment.tsx';
import './CommentList.scss'
const CommentList = ({ comments }) => {
  return (
    <div className='commentList'>
      {comments.map(comment => (
        <Comment key={comment.commentId} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
