import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    files: [],
    userInfo: null, // New state property to store user information
  },
  reducers: {
    addFile: (state, action) => {
      state.files.push({
        name: action.payload.name,
        content: action.payload.content,
      });
    },
    removeFile: (state, action) => {
      state.files.splice(action.payload, 1);
    },
    setUser: (state, action) => {
      state.userInfo = {
        email: action.payload.email,
        role: action.payload.role,
      };
    },
    logoutUser: (state) => {
      state.userInfo = null; // Clear user info on logout
    }
  },
});

export const { addFile, removeFile, setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
