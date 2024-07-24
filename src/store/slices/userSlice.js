import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: [],
  reducers: {
    addFile: (state, action) => {
      console.log("Adding file", {
        name: action.payload.name,
        size: action.payload.size,
        lastModified: action.payload.lastModified,
      });
      state.push({
        name: action.payload.name,
        size: action.payload.size,
        lastModified: action.payload.lastModified,
      });
    },
    removeFile: (state, action) => {},
  },
});

export default userSlice;
export const { addFile } = userSlice.actions;
