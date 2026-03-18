import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../utils/types";
import { isTokenExpired } from "../../utils";

// ─── Rehydrate from localStorage ──────────────────────────────────────────────

const storedToken = localStorage.getItem("auth_token");
const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
const isValid = storedToken ? !isTokenExpired(storedToken) : false;

const initialState: AuthState = {
  token: isValid ? storedToken : null,
  user: isValid ? storedUser : null,
  isAuthenticated: isValid,
  isLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
    },
  },
});

export const { setCredentials, setUser, setAuthenticated, setLoading, logout } =
  authSlice.actions;
export default authSlice.reducer;
