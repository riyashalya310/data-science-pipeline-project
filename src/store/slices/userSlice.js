import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    files: [],
    userInfo: null,
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
    updateFile: (state, action) => {
      const fileIndex = state.files.findIndex(
        (file) => file.name === action.payload.name
      );
      if (fileIndex !== -1) {
        state.files[fileIndex].content = action.payload.content;
      }
    },
    setUser: (state, action) => {
      state.userInfo = {
        email: action.payload.email,
        role: action.payload.role,
      };
    },
    logoutUser: (state) => {
      state.userInfo = null;
    },
  },
});

export const { addFile, removeFile, updateFile, setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
