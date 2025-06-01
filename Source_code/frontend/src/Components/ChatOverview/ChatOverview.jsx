import "./chatroom.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Conversation from "./Conversation";
import Loading from "../Loading/Loading";
import { useNavigate } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

const ChatOverview = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user?.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/conversation/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user?._id]);

  const handleBackToHome = () => {
    navigate("/"); // Điều hướng về trang chủ
  };

  return (
    <section className="message-container">
      <ul className="contact-list">
        <li>Chats</li>
      </ul>
      <div className="contact-container-div">
        {isLoading ? (
          <Loading loadingType="ClipLoader" color="white" size="32px" loading={isLoading} />
        ) : (
          conversations.map((conversation) => (
            <Conversation key={conversation._id} conversation={conversation} currentUser={user} />
          ))
        )}
      </div>
      <AiOutlineHome size="32px" className="home-icon" onClick={handleBackToHome} />
    </section>
  );
};

export default ChatOverview;
