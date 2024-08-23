export const updateFileContent = (fileName, updatedContent) => ({
  type: 'UPDATE_FILE_CONTENT',
  payload: { fileName, updatedContent }
});
