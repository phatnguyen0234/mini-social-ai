import { BiCommentDetail, BiLike, BiDislike } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { format } from "timeago.js";
import { MdSend } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./post.css";
import "../Feed/HomePage/homepage.css";
import { fullPostToggle, setDelete } from "../../redux/navigateSlice";
import {
  addComment,
  addToFavorites,
  downvotePost,
  upvotePost,
} from "../../redux/apiRequests";
import Comments from "../Comments/Comments";
import InputField from "../InputFields/Input";
import React, { useState, useEffect } from "react";
import { listContainer } from "../../utils/listContainer";

const Posts = React.forwardRef((props, ref) => {
  const { post, comments, setDeleteComment, deleteComment } = props;
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const user = useSelector((state) => state.user.user?.currentUser);
  const [totalLikes, setTotalLikes] = useState(post?.upvotes?.length || 0);
  const [totalDislikes, setTotalDislikes] = useState(post?.downvotes?.length || 0);
  const [commentCount, setCommentCount] = useState(post?.comments || 0);
  const [isUpVote, setUpVote] = useState(false);
  const [isDownVote, setDownVote] = useState(false);
  const fullPost = useSelector((state) => state.nav.fullPost);
  const tags = listContainer.tags;
  const dispatch = useDispatch();

  // Reset and update states when post changes
  useEffect(() => {
    if (post) {
      setTotalLikes(post.upvotes?.length || 0);
      setTotalDislikes(post.downvotes?.length || 0);
      setCommentCount(post.comments || 0);
    }
  }, [post]);

  // Cập nhật trạng thái like/dislike khi user thay đổi
  useEffect(() => {
    if (user && post) {
      setUpVote(post.upvotes?.includes(user._id) || false);
      setDownVote(post.downvotes?.includes(user._id) || false);
    } else {
      setUpVote(false);
      setDownVote(false);
    }
  }, [user, post]);

  // Update comment count when comments array changes
  useEffect(() => {
    if (comments) {
      // Only update if in full post view to avoid overwriting the database count
      if (fullPost?.postId === post?._id) {
        setCommentCount(comments.length);
      }
    }
  }, [comments, fullPost?.postId, post?._id]);

  const handleDelete = (id) => {
    dispatch(
      setDelete({
        status: false,
        open: true,
        id: id,
      })
    );
  };
  const handleReadmore = (id) => {
    const setFullPost = {
      open: true,
      postId: id,
    };
    dispatch(fullPostToggle(setFullPost));
  };
  const closeFullPost = () => {
    const closePost = {
      open: false,
    };
    dispatch(fullPostToggle(closePost));
  };  const handleUpVote = async (id) => {
    if (!user?._id) return;
    
    const userId = {
      userId: user._id,
    };
    
    try {
      // Gọi API trước để đảm bảo thành công
      await upvotePost(dispatch, user?.accessToken, id, userId);
      
      // Sau khi API thành công mới cập nhật UI
      if (isUpVote) {
        setTotalLikes(prev => prev - 1);
        setUpVote(false);
      } else if (isDownVote) {
        setTotalLikes(prev => prev + 1);
        setTotalDislikes(prev => prev - 1);
        setUpVote(true);
        setDownVote(false);
      } else {
        setTotalLikes(prev => prev + 1);
        setUpVote(true);
      }
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };  const handleDownVote = async (id) => {
    if (!user?._id) return;
    
    const userId = {
      userId: user._id,
    };
    
    try {
      // Gọi API trước để đảm bảo thành công
      await downvotePost(dispatch, user?.accessToken, id, userId);
      
      // Sau khi API thành công mới cập nhật UI
      if (isDownVote) {
        setTotalDislikes(prev => prev - 1);
        setDownVote(false);
      } else if (isUpVote) {
        setTotalDislikes(prev => prev + 1);
        setTotalLikes(prev => prev - 1);
        setDownVote(true);
        setUpVote(false);
      } else {
        setTotalDislikes(prev => prev + 1);
        setDownVote(true);
      }
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  const handleComment = async (event, id) => {
    event.preventDefault();
    if (!comment.trim()) return; // Don't submit empty comments

    const newComment = {
      content: comment,
      ownerId: user?._id,
    };

    try {
      await addComment(dispatch, user?.accessToken, id, newComment);
      setComment(""); // Clear input field
      setCommentCount(prev => prev + 1); // Increment comment count immediately
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentDeleted = () => {
    setCommentCount(prev => prev - 1);
  };

  return (
    <div key={post?._id} ref={ref} className="post-container">
      {fullPost?.postId === post?._id && (
        <div className="close-post" onClick={closeFullPost}>
          Close
        </div>
      )}
      <div className="post-info">
        <div
          className="post-ava-container"
          style={{ backgroundColor: `${post?.theme}` }}
        >
          <img
            className="post-ava"
            src={post?.avaUrl}
            onClick={() => navigate(`/user/${post?.userId}`)}
            alt="post user img"
          />
        </div>
        <div className="post-author">
          u/{post?.username}
          <div className="post-time">{format(post?.createdAt)}</div>
        </div>
        <div className="features-container">
          {(user?._id === post?.userId || user?.isAdmin) && (
            <div className="post-edit-delete">
              <BsTrash
                size={"24px"}
                color="red"
                onClick={() => handleDelete(post?._id)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="post-context">
        <button className={`posts-tags-${tags[post?.tags]}`}>
          {" "}
          {tags[post?.tags]}
        </button>
        <div className="post-title">{post?.title}</div>
        {fullPost?.postId === post?._id ? (
          <></>
        ) : (
          post?.description?.length > 200 && (
            <span
              className="post-desc-readmore"
              onClick={() => handleReadmore(post?._id)}
            >
              Click to read more
            </span>
          )
        )}
        <div
          className={`${
            fullPost?.postId === post?._id ? "post-desc-full" : "post-desc"
          }`}
        >
          {post?.description}
        </div>
        {post?.imageUrl && (
          <div className="post-image-container">
            <img className="post-image" src={post?.imageUrl} alt="postImg" />
          </div>
        )}
      </div>
      <div className="post-interactions">
        <div className="post-vote">
          <div className="like">
            <BiLike
              size={"24px"}
              color={isUpVote ? "#4287f5" : ""}
              onClick={() => handleUpVote(post?._id)}
            />
            <span className="vote-count">{totalLikes}</span>
          </div>
          <div className="dislike">
            <BiDislike
              size={"24px"}
              color={isDownVote ? "#f54242" : ""}
              onClick={() => handleDownVote(post?._id)}
            />
            <span className="vote-count">{totalDislikes}</span>
          </div>
          <div className="comments">
            <BiCommentDetail
              size={"24px"}
              onClick={() => handleReadmore(post?._id)}
            />
          </div>
          <div className="comment-no"> {commentCount} </div>
        </div>
        {fullPost?.postId === post?._id && (
          <div className="comments-opened">
            <div className="comments-title">All comments</div>
            {comments?.map((comment) => {
              return (
                <Comments
                  key={comment._id}
                  _id={comment._id}
                  setDeleteComment={setDeleteComment}
                  deleteComment={deleteComment}
                  postId={comment.postId}
                  ownerId={comment.ownerId}
                  username={comment.username}
                  avaUrl={comment.avaUrl}
                  theme={comment.theme}
                  createdAt={comment.createdAt}
                  updatedAt={comment.updatedAt}
                  content={comment.content}
                  onCommentDeleted={handleCommentDeleted}
                />
              );
            })}
            <form
              className="comments-interact"
              onSubmit={(e) => handleComment(e, post?._id)}
            >
              <img
                src={user?.profilePicture}
                className="user-avatar"
                style={{ backgroundColor: `${user?.theme}` }}
                alt="user avatar"
              />
              <InputField
                data={comment}
                value={comment}
                setData={setComment}
                type="text"
                placeholder="Add a comment"
                classStyle="comment-input"
              />
              <MdSend
                size="32px"
                className="submit-comment"
                onClick={(e) => handleComment(e, post?._id)}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

export default Posts;
<></>;
