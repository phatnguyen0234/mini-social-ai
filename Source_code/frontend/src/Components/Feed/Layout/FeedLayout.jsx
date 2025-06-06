import "../feed.css";
import { useSelector } from "react-redux";
import SideBar from "../SideBar/FeedSideBar";
import FeedHeader from "../Header/FeedHeader";
import FeedNavBar from "../FeedNavBar/FeedNavBar";
import Footer from "../../Footer/Footer";
import MakePost from "../../Posts/MakePost";
import ChatOverview from "../../ChatOverview/ChatOverview";
const FeedLayout = ({ children }) => {
  const isOpenPost = useSelector((state) => state.nav.makepost.open);
  const openMsg = useSelector((state) => state.nav.message.open);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const isOpen = useSelector((state) => state.nav.sidebar.open);

  console.log("FeedLayout state:", {
    isOpenPost,
    openMsg,
    user: user?._id,
    isOpen,
  });

  return (
    <>
      {user && (
        <>
          <SideBar />

          {isOpenPost ? (
            <section
              className={`${
                isOpen ? "feed-container-opened" : "feed-container"
              }`}
            >
              <FeedHeader />
              <FeedNavBar />
              <MakePost />
            </section>
          ) : !isOpenPost && !openMsg ? (
            <section
              className={`${
                isOpen ? "feed-container-opened" : "feed-container"
              }`}
            >
              <FeedHeader />
              <FeedNavBar />
              {children}
            </section>
          ) : (
            <section
              className={`${
                isOpen ? "feed-container-opened" : "feed-container"
              }`}
            >
              <FeedHeader />
              <ChatOverview />
            </section>
          )}
          <Footer />
        </>
      )}
    </>
  );
};

export default FeedLayout;
