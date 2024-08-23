const initialState = {
    files: []
  };
  
  const fileReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'UPDATE_FILE_CONTENT': {
        const { fileName, updatedContent } = action.payload;
        return {
          ...state,
          files: state.files.map(file =>
            file.name === fileName
              ? { ...file, content: updatedContent }
              : file
          )
        };
      }
      default:
        return state;
    }
  };
  
  export default fileReducer;
  