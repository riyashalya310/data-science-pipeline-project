import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
    name:"user",
    initialState: [],
    reducers:{
        addFile: (state,action)=>{
            state.push(action.payload)
        },
        removeFile: (state,action)=>{
            state.splice(action.payload,1)
        }
    }
})

export const {addFile,removeFile}=userSlice.actions
export default userSlice