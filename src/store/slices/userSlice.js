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
        columnTypes: action.payload.columnTypes || {},
        categoricalColumns: action.payload.categoricalColumns || [], // Add categorical columns list
      });
    },
    removeFile: (state, action) => {
      state.files.splice(action.payload, 1);
    },
    updateFile: (state, action) => {
      const { name, content, columnTypes, categoricalColumns } = action.payload;
      const fileIndex = state.files.findIndex((file) => file.name === name);
      if (fileIndex !== -1) {
        state.files[fileIndex].content = content;
        if (columnTypes) {
          state.files[fileIndex].columnTypes = columnTypes;
        }
        if (categoricalColumns) {
          state.files[fileIndex].categoricalColumns = categoricalColumns; // Update categorical columns if provided
        }
      }
    },
    updateColumnType: (state, action) => {
      const { name, columnName, newType } = action.payload;
      const fileIndex = state.files.findIndex((file) => file.name === name);
      if (fileIndex !== -1) {
        if (!state.files[fileIndex].columnTypes) {
          state.files[fileIndex].columnTypes = {};
        }
        state.files[fileIndex].columnTypes[columnName] = newType;
      }
    },
    updateCategoricalColumns: (state, action) => {
      const { name, categoricalColumns } = action.payload;
      const fileIndex = state.files.findIndex((file) => file.name === name);
      if (fileIndex !== -1) {
        state.files[fileIndex].categoricalColumns = categoricalColumns;
      }
    },
    updateOriginalCategories: (state, action) => {
      const { name, originalCategories } = action.payload;
      const fileIndex = state.files.findIndex((file) => file.name === name);
      if (fileIndex !== -1) {
        state.files[fileIndex].originalCategories = originalCategories; // Store original categories
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

export const {
  addFile,
  removeFile,
  updateFile,
  updateColumnType,
  updateCategoricalColumns,
  updateOriginalCategories,
  setUser,
  logoutUser,
} = userSlice.actions;
export default userSlice.reducer;
