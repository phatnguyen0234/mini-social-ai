import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  login: {
    currentUser: null,
    error: false,
    isFetching: false,
    success: false,
    message: null,
  },
  register: {
    error: false,
    isFetching: false,
    success: false,
    message:null,
  },
  logout: {
    error: false,
    isFetching: false,
    success: false,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.login.isFetching = true;
      state.login.error = false;
      state.login.message = null;
    },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.error = false;
      state.login.success = true;
      state.login.currentUser = action.payload;
      state.login.message = null;
    },
    loginFailed: (state, action) => {
      state.login.isFetching = false;
      state.login.error = true;
      state.login.success = false;
      state.login.message = action.payload;
    },
    resetLoginError: (state) => {
      state.login.error = false;
      state.login.message = null;
    },
    registerStart: (state) => {
      state.register.isFetching = true;
      state.register.error = false;
      state.register.success = false;
      state.register.message = null;
    },
    registerSuccess: (state, action) => {
      state.register.isFetching = false;
      state.register.error = false;
      state.register.success = true;
      state.register.message = action.payload;
    },
    registerFailed: (state, action) => {
      state.register.isFetching = false;
      state.register.error = true;
      state.register.success = false;
      state.register.message = action.payload;
    },
    registerReset: (state) => {
      state.register.isFetching = false;
      state.register.error = false;
      state.register.success = false;
      state.register.message = null;
    },
    logoutStart: (state) => {
      state.logout.isFetching = true;
    },
    logoutSuccess: (state) => {
      state.logout.isFetching = false;
      state.logout.success = true;
    },
    logoutFailed: (state) => {
      state.logout.isFetching = false;
      state.logout.error = true;
      state.logout.success = false;
    },
    logout: (state) => {
      state.login.currentUser = null;
      state.login.error = false;
      state.login.isFetching = false;
      state.login.success = false;
      state.login.message = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  resetLoginError,
  registerStart,
  registerSuccess,
  registerFailed,
  registerReset,
  logoutStart,
  logoutSuccess,
  logoutFailed,
  logout, // Export the new logout action
} = authSlice.actions;
export default authSlice.reducer;
