import { useState } from "react";
import { useSelector } from "react-redux";
import FeedLayout from "../Feed/Layout/FeedLayout";
import useFetchData from "../Hooks/useFetchData";
import { baseURL } from "../../utils/listContainer";
import Loading from "../Loading/Loading";
import Posts from "../Posts/Posts";
import FullPost from "../Posts/FullPost/FullPost";

const Friends = () => {
  const fullPost = useSelector((state) => state.nav.fullPost);
  const user = useSelector((state) => state.user.user?.currentUser);

  // Sử dụng useFetchData để lấy bài viết từ timeline (chỉ từ bạn bè)
  const { isLoading, apiData: friendPosts, serverError } = useFetchData(
    `${baseURL}/post/timeline`,
    user?.accessToken,
    "post",
    user._id
  );

  const [deleteComment, setDeleteComment] = useState([]);
  const allComments = useSelector((state) => state.post.allPosts?.comments);
  const openedComment = allComments?.filter(
    (comment) => comment.postId === fullPost.postId
  );
  const filteredComment =
    openedComment?.filter((comment) => !deleteComment.includes(comment._id)) || [];

  // Lọc ra những bài viết không phải của chính mình
  const filteredPosts = friendPosts?.filter((post) => post.userId !== user._id) || [];

  if (serverError) {
    return (
      <FeedLayout>
        <div style={{ color: "white", textAlign: "center" }}>
          Error loading friends' posts. Please try again later.
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <Loading
        loadingType="BeatLoader"
        color="white"
        size="10px"
        loading={isLoading}
      />
      {filteredPosts.length === 0 && !isLoading ? (
        <div
          style={{
            color: "white",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          No posts from friends yet. Follow some users to see their posts here!
        </div>
      ) : (
        <>
          {fullPost.open && <FullPost />}
          {filteredPosts.map((post) => (
            <Posts
              key={post._id}
              post={post}
              comments={filteredComment}
              setDeleteComment={setDeleteComment}
              deleteComment={deleteComment}
            />
          ))}
        </>
      )}
    </FeedLayout>
  );
};

export default Friends;
