import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../utils/types";
import { isTokenExpired } from "../../utils";

// ─── Rehydrate from localStorage ──────────────────────────────────────────────

const storedToken = localStorage.getItem("auth_token");
const isValid = storedToken ? !isTokenExpired(storedToken) : false;

const initialState: AuthState = {
  token: isValid ? storedToken : null,
  user: null,
  isAuthenticated: isValid,
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem("auth_token", action.payload.token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("auth_token");
    },
  },
});

export const { setCredentials, setUser, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;
