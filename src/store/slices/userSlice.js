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
        columnTypes: action.payload.columnTypes || {}, // Ensure it's initialized
      });
    },
    removeFile: (state, action) => {
      state.files.splice(action.payload, 1);
    },
    updateFile: (state, action) => {
      const { name, content, columnTypes } = action.payload;
      const fileIndex = state.files.findIndex(file => file.name === name);
      if (fileIndex !== -1) {
        state.files[fileIndex].content = content;
        if (columnTypes) {
          state.files[fileIndex].columnTypes = columnTypes; // Update dtype if provided
        }
      }
    },
    updateColumnType: (state, action) => {
      const { name, columnName, newType } = action.payload;
      const fileIndex = state.files.findIndex(file => file.name === name);
      if (fileIndex !== -1) {
        // Ensure columnTypes is initialized
        if (!state.files[fileIndex].columnTypes) {
          state.files[fileIndex].columnTypes = {};
        }
        state.files[fileIndex].columnTypes[columnName] = newType; // Update the specific column dtype
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

export const { addFile, removeFile, updateFile, updateColumnType, setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
