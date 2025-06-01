import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../../utils/listContainer";
import { format } from "timeago.js";
import "./chatroom.css";

const Conversation = (props) => {
  const { conversation, currentUser } = props;
  const [user, setUser] = useState(null);

  // Use otherMember info from enhanced conversation object
  useEffect(() => {
    if (conversation.otherMember) {
      setUser(conversation.otherMember);
    }
  }, [conversation]);

  return (
    <section className="contact-container">
      <div className="contact-img-container">
        <img
          src={user?.profilePicture}
          alt="profile pic"
          className="contact-img"
          style={{ backgroundColor: `${user?.theme}` }}
        />
      </div>
      <div className="preview-container">
        <div className="preview-username">u/{user?.username}</div>
        {conversation.lastMessage && (
          <div className="preview-message">
            <span className="preview-text">
              {conversation.lastMessage.text}
            </span>
            <span className="preview-time">
              {format(conversation.lastMessage.createdAt)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Conversation;
