import { useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import "./chatroom.css";
import { useState } from "react";
import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Message from "./Message";
import { baseURL } from "../../utils/listContainer";
import Footer from "../Footer/Footer";
import InputField from "../InputFields/Input";
const ChatRoom = () => {
  const user = useSelector((state) => state.user.user?.currentUser);
  const room = useSelector((state) => state.nav.message.room);
  const [messages, setMessage] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [receivedMsg, setReceivedMsg] = useState(null);
  const socket = useRef();
  const [partner, setPartner] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef();
  const { id } = useParams();
  
  const axiosInstance = axios.create({
    headers: {
      token: `Bearer ${user?.accessToken}`,
    },
  });

  // Initialize socket connection
  useEffect(() => {
    socket.current = io("https://reddat-socket.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle socket events
    socket.current.on("getMessage", (data) => {
      setReceivedMsg({
        sender: data.senderId,
        text: data.text,
        conversationId: id,
        createdAt: Date.now(),
      });
    });

    socket.current.on("connect", () => {
      console.log("Socket connected");
      socket.current.emit("addUser", user?._id);
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user?._id]);

  // Handle received messages
  useEffect(() => {
    if (receivedMsg && room?.members.includes(receivedMsg.sender)) {
      setMessage((prevMessages) => [...prevMessages, receivedMsg]);
      // Reset receivedMsg to prevent duplicate additions
      setReceivedMsg(null);
    }
  }, [receivedMsg, room]);

  // Fetch messages and partner info
  useEffect(() => {
    const getMessage = async () => {
      try {
        const partnerId = room?.members.find((m) => m !== user?._id);
        const [partnerRes, msgRes] = await Promise.all([
          axiosInstance.get(`${baseURL}/users/${partnerId}`),
          axiosInstance.get(`${baseURL}/message/${room._id}`),
        ]);
        setPartner(partnerRes.data);
        setMessage(msgRes.data);
      } catch (e) {
        console.error("Error fetching messages:", e);
      }
    };

    if (room?._id) {
      getMessage();
    }
  }, [room?._id, user?._id]);
  const handleGoBack = () => {
    socket.current.disconnect();
    navigate(-1); // Go back to previous page
  };

  const submitMessage = async () => {
    if (newMsg.trim().length === 0) return;

    const messageData = {
      sender: user?._id,
      text: newMsg,
      conversationId: id,
    };

    const receiverId = partner?._id;
    
    try {
      // Send message to socket server first
      socket.current.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: newMsg,
      });

      // Then save to database
      const res = await axios.post(`${baseURL}/message`, messageData, {
        headers: { token: `Bearer ${user.accessToken}` },
      });

      // Update local state with the new message
      setMessage((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <section className="convo-container">
      <div className="convo-header">
        <div className="message-header">
          <div className="go-back-convo" onClick={handleGoBack}>
            <IoIosArrowRoundBack size={"42px"}/>
          </div>
          {partner?.username}{" "}
        </div>
      </div>
      <div className="chat-box-top">
        {messages.map((msg) => {
          return (
            <div ref={scrollRef} className="msg-container">
              <Message
                message={msg}
                own={msg.sender === user._id}
                partner={partner}
              />
            </div>
          );
        })}
      </div>
      <div className="chat-box-bot">
        <InputField
          classStyle="chat-msg-input"
          inputType="textarea"
          placeholder="write something..."
          setData={setNewMsg}
          value={newMsg}
          data={newMsg}
        />
        <button className="chat-submit" onClick={submitMessage}>
          Send
        </button>
      </div>
      <Footer />
    </section>
  );
};

export default ChatRoom;
