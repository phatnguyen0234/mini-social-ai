import { baseURL } from "../utils/listContainer";
import {
  updateStart,
  updateSuccess,
  updateError,
  getUserStart,
  getUserSuccess,
  getUserFailed,
  followUserStart,
  followUserSuccess,
  followUserFailed,
} from "./userSlice";
import axios from "axios";
import {
  loginFailed,
  loginStart,
  loginSuccess,
  logoutFailed,
  logoutStart,
  logoutSuccess,
  registerFailed,
  registerStart,
  registerSuccess,
} from "./authSlice";
import {
  createPostFailed,
  createPostStart,
  createPostSuccess,
  deletePostFailed,
  deletePostStart,
  deletePostSuccess,
  getAllPostFailed,
  getAllPostStart,
  getAllPostSuccess,
  getOnePostFailed,
  getOnePostStart,
  getOnePostSuccess,
  getUserPostFailed,
  getUserPostStart,
  getUserPostSuccess,
  interactPostFailed,
  interactPostStart,
  interactPostSuccess,
} from "./postSlice";
import {
  addCommentFailed,
  addCommentStart,
  addCommentSuccess,
  deleteCommentFailed,
  deleteCommentStart,
  deleteCommentSuccess,
  getUserCommentStart,
  getUserCommentFailed,
  getUserCommentSuccess,
} from "./commentSlice";

//AUTH
export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart()); // This already resets error state
  try {
    const res = await axios.post(`${baseURL}/auth/login`, user, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      withCredentials: true
    });

    if (res.data) {
      dispatch(loginSuccess(res.data));
      dispatch(updateSuccess(res.data));
      localStorage.setItem("userId", res.data._id);
      navigate("/home");
    }
  } catch (err) {
    let errorMessage = "Login failed. Please try again.";
    
    if (err.response?.data?.message) {
      const serverMessage = err.response.data.message;
      if (serverMessage === "Incorrect username" || serverMessage === "User not found") {
        errorMessage = "Email not found";
      } else if (serverMessage === "Incorrect password") {
        errorMessage = "Incorrect password";
      } else {
        errorMessage = serverMessage;
      }
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = "Request timed out. Please try again.";
    } else if (!err.response) {
      errorMessage = "Network error. Please check your connection.";
    }
    
    console.error("Login error details:", {
      error: err,
      response: err.response,
      message: errorMessage
    });
    
    dispatch(loginFailed(errorMessage));
    dispatch(updateError());
  }
};

export const registerUser = async (user, dispatch, navigate) => {
  dispatch(registerStart());
  try {
    const fullUrl = `${baseURL}/auth/register`;
    console.log("=== DEBUG REGISTER ===");
    console.log("1. Full URL:", fullUrl);
    console.log("2. Request Data:", user);

    const res = await axios({
      method: 'post',
      url: fullUrl,
      data: {
        username: user.username,
        email: user.email,
        password: user.password
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log("4. Server Response:", res.data);
    
    if (res.data?.message === "User created successfully") {
      dispatch(registerSuccess("Registration successful! You can login now."));
    } else {
      const errorMsg = res.data?.message || "Registration failed. Please try again.";
      console.log("5. Error from success block:", errorMsg);
      dispatch(registerFailed(errorMsg));
    }
  } catch (err) {
    console.log("=== DEBUG ERROR ===");
    console.log("1. Error Response:", err.response?.data);
    console.log("2. Error Status:", err.response?.status);

    let errorMessage = "Registration failed. Please try again.";
    
    if (err.response?.data?.message) {
      const serverMessage = err.response.data.message;
      
      if (serverMessage === "Username already exists") {
        errorMessage = `Username "${user.username}" already exists. Please choose another username.`;
      } 
      else if (serverMessage === "Email already exists") {
        errorMessage = `Email "${user.email}" is already in use. Please:\n- Use another email, or\n- Login if this is your email.`;
      }
      else if (serverMessage === "Email, username and password are required") {
        errorMessage = "Please fill in all required fields (email, username and password).";
      }
      else if (serverMessage === "Password must be at least 8 characters") {
        errorMessage = "Password must be at least 8 characters long.";
      }
      else {
        errorMessage = serverMessage;
      }
    }
    else if (err.code === 'ECONNABORTED') {
      errorMessage = "Could not connect to server. Please try again later.";
    }
    else if (!err.response) {
      errorMessage = "Could not connect to server. Please check your internet connection.";
    }
    
    console.log("5. Final Error Message:", errorMessage);
    dispatch(registerFailed(errorMessage));
  }
};

export const logOutUser = async (dispatch, token, userId, navigate) => {
  dispatch(logoutStart());
  dispatch({ type: "auth/registerReset" }); // Reset registration state on logout
  try {
    // Try to refresh token before logout
    try {
      const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {}, {
        withCredentials: true  // To send cookies
      });
      if (refreshRes.data?.accessToken) {
        token = refreshRes.data.accessToken;
      }
    } catch (refreshErr) {
      console.log("Refresh token failed:", refreshErr);
    }

    // Try logout with new or old token
    try {
      await axios.post(
        `${baseURL}/auth/logout`,
        { userId },
        {
          headers: { 
            token: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true  // To send and receive cookies
        }
      );
    } catch (logoutErr) {
      console.log("Logout API failed:", logoutErr);
    }

    // Always clear local storage and redirect
    dispatch(logoutSuccess());
    localStorage.clear();
    navigate("/login");
  } catch (err) {
    console.error("Final logout error:", err);
    // Still clear local storage and redirect in case of error
    dispatch(logoutSuccess());
    localStorage.clear();
    navigate("/login");
  }
};

export const updateUser = async (dispatch, user, id, token) => {
  dispatch(updateStart());
  try {
    const res = await axios.put(`${baseURL}/users/${id}`, user, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(updateSuccess(res.data));
  } catch (err) {
    console.log(err);
    dispatch(updateError());
  }
};

export const getUser = async (dispatch, id, token) => {
  dispatch(getUserStart());
  try {
    const res = await axios.get(`${baseURL}/users/${id}`, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(getUserSuccess(res.data));
  } catch (err) {
    dispatch(getUserFailed());
  }
};

export const followUser = async (
  dispatch,
  id,
  userId,
  token,
  setFollow,
  isFollowed
) => {
  dispatch(followUserStart());
  try {
    const res = await axios.put(`${baseURL}/users/${id}/follow`, userId, {
      headers: { token: `Bearer ${token}` },
    });
    setFollow(isFollowed ? false : true);
    const update = {
      ...res.data,
      accessToken: token,
    };
    dispatch(followUserSuccess(res.data));
    dispatch(updateSuccess(update));
  } catch (err) {
    dispatch(followUserFailed());
  }
};

//POST
export const getAllPosts = async (
  dispatch,
  token,
  hot,
  pageNumber,
  setHasMore
) => {
  dispatch(getAllPostStart());
  try {
    const res = await axios.get(
      hot
        ? `${baseURL}/post?${hot}=true&page=${pageNumber}&limit=2`
        : `${baseURL}/post?page=${pageNumber}&limit=2`,
      {
        headers: { token: `Bearer ${token}` },
      }
    );
    setHasMore(res.data.results.length > 0);
    dispatch(getAllPostSuccess(res.data.results));
  } catch (err) {
    dispatch(getAllPostFailed());
  }
};

export const getUserPost = async (dispatch, token, userId) => {
  dispatch(getUserPostStart());
  try {
    const res = await axios.get(`${baseURL}/post/user/${userId}`, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(getUserPostSuccess(res.data));
  } catch (err) {
    dispatch(getUserPostFailed());
  }
};

export const getOnePost = async (dispatch, token, postId) => {
  dispatch(getOnePostStart());
  try {
    const res = await axios.get(`${baseURL}/post/fullpost/${postId}`, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(getOnePostSuccess(res.data));
  } catch (err) {
    dispatch(getOnePostFailed());
  }
};

export const getUserComment = async (dispatch, token, postId) => {
  dispatch(getUserCommentStart());
  try {
    const res = await axios.get(`${baseURL}/post/comment/${postId}`, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(getUserCommentSuccess(res.data));
  } catch (err) {
    dispatch(getUserCommentFailed());
  }
};

export const createPost = async (dispatch, token, post, postToggle) => {
  dispatch(createPostStart());
  try {
    await axios.post(`${baseURL}/post`, post, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(postToggle(false));
    dispatch(createPostSuccess());
  } catch (err) {
    dispatch(createPostFailed());
  }
};

export const deletePost = async (
  dispatch,
  token,
  id,
  userId,
  setDelete,
  setDeletedPostId,
  deletedPostId
) => {
  dispatch(deletePostStart());
  try {
    await axios.delete(`${baseURL}/post/${id}`, {
      headers: { token: `Bearer ${token}` },
      data: { userId: userId },
    });
    dispatch(deletePostSuccess());
    setDeletedPostId([...deletedPostId, id]);
    setDelete({
      open: false,
      status: true,
    });
  } catch (err) {
    dispatch(deletePostFailed());
  }
};

export const upvotePost = async (dispatch, token, id, userId) => {
  dispatch(interactPostStart());
  try {
    await axios.put(`${baseURL}/post/${id}/upvote`, userId, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(interactPostSuccess());
  } catch (err) {
    dispatch(interactPostFailed());
  }
};

export const downvotePost = async (dispatch, token, id, userId) => {
  dispatch(interactPostStart());
  try {
    await axios.put(`${baseURL}/post/${id}/downvote`, userId, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(interactPostSuccess());
  } catch (err) {
    dispatch(interactPostFailed());
  }
};

//COMMENT
export const addComment = async (dispatch, token, id, comment) => {
  dispatch(addCommentStart());
  try {
    const res = await axios.post(`${baseURL}/post/comment/${id}`, comment, {
      headers: { token: `Bearer ${token}` },
    });
    dispatch(addCommentSuccess(res.data));
    // Fetch updated comments
    await getUserComment(dispatch, token, id);
    // Also fetch the updated post to get the new comment count
    await getOnePost(dispatch, token, id);
    return res.data;
  } catch (err) {
    dispatch(addCommentFailed());
    throw err;
  }
};

export const deleteUserComment = async (
  dispatch,
  token,
  id,
  ownerId,
  setDeletedCommentId,
  comment
) => {
  dispatch(deleteCommentStart());
  try {
    await axios.delete(`${baseURL}/post/comment/${id}`, {
      headers: { token: `Bearer ${token}` },
      data: { ownerId: ownerId },
    });
    setDeletedCommentId([...comment, id]);
    dispatch(deleteCommentSuccess());
    // Fetch the updated post to get the new comment count
    if (comment.postId) {
      await getOnePost(dispatch, token, comment.postId);
    }
  } catch (err) {
    dispatch(deleteCommentFailed());
    throw err;
  }
};
