// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice'; // Adjust path if necessary

const store = configureStore({
  reducer: {
    user: userReducer,
    // other reducers...
  },
});

export default store;
