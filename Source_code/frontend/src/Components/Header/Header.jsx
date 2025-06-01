import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import { baseURL } from "../../utils/listContainer";
import { followUser, getUser } from "../../redux/apiRequests";
import "./header.css";
import { setRoom } from "../../redux/navigateSlice";
import { logout } from "../../redux/authSlice";

const Header = (props) => {
  const user = useSelector((state) => state.user.user?.currentUser);
  const currentUser = useSelector((state) => state.user.otherUser?.otherUser);
  const { id } = useParams();
  const [isFollowed, setFollowed] = useState(user?.followings.includes(id));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setEdit, isEdit } = props;
  const handleEdit = () => {
    setEdit(!isEdit);
  };

  useEffect(() => {
    getUser(dispatch, id, user?.accessToken);
  }, [dispatch, id, user?.accessToken]);

  const handleFollow = () => {
    // Prevent following yourself
    if (user?._id === id) {
      return;
    }

    const userId = {
      userId: user?._id,
    };
    followUser(
      dispatch,
      id,
      userId,
      user?.accessToken,
      setFollowed,
      isFollowed
    );
  };

  const goToChat = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/conversation/find/${id}/${user?._id}`,
        {
          headers: { token: `Bearer ${user?.accessToken}` },
        }
      );
      if (res.data) {
        dispatch(setRoom(res.data));
        navigate(`/chat/${res.data._id}`);
      } else {
        const newConvo = {
          senderId: user?._id,
          receiverId: id,
        };
        await axios
          .post(`${baseURL}/conversation`, newConvo, {
            headers: { token: `Bearer ${user?.accessToken}` },
          })
          .then((res) => {
            dispatch(setRoom(res.data));
            navigate(`/chat/${res.data._id}`);
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const formatAccountAge = (createdAt) => {
    if (!createdAt) return "New user";
    const now = new Date();
    const created = new Date(createdAt);
    const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "Joined today";
    if (diffInDays === 1) return "Joined yesterday";
    if (diffInDays < 30) return `${diffInDays} days on Reddat`;
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} on Reddat`;
    }
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? "year" : "years"} on Reddat`;
  };

  return (
    <header
      style={{
        backgroundColor: "#6A1B9A",
        backgroundImage:
          "linear-gradient(180deg, #9575CD 0%, #6A1B9A 65%, #4A148C 100%)",
      }}
    >
      <div className="info-container">
        <div className="edit-goback">          <div className="go-back">
            <IoChevronBackOutline
              size={"24px"}
              onClick={() => navigate(-1)}
            />
          </div>
          {user?._id === id ? (
            <div className="header-buttons">
              <button className="button-edit" onClick={handleEdit}>
                Edit
              </button>
              <button className="button-logout" onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}>
                Log Out
              </button>
            </div>
          ) : user ? (
            <div className="chat-follow-buttons">
              <button
                className="follow"
                onClick={handleFollow}
                disabled={user?._id === id}
              >
                {`${isFollowed ? "👌 Following" : "Follow"}`}
              </button>
              {user?._id !== id && (
                <AiOutlineMessage
                  size="24px"
                  className="message-icon"
                  onClick={goToChat}
                />
              )}
            </div>
          ) : null}
        </div>
        <img className="info-ava" src={currentUser?.profilePicture} alt="" />
        <div className="info-displayname">
          {`${currentUser?.displayName}`}
          <span className="info-username"> (u/{currentUser?.username})</span>
        </div>
        <div className="info-age">
          {formatAccountAge(currentUser?.createdAt)}
        </div>
        <div className="info-about">{currentUser?.about}</div>
      </div>
    </header>
  );
};

export default Header;
