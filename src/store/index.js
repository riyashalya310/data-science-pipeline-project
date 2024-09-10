// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import fileReducer from '../redux/reducer'; // Adjust path if necessary

const store = configureStore({
  reducer: {
    user: userReducer,
    files: fileReducer,
    // other reducers...
  },
});

export default store;
