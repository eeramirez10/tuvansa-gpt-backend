export const removeLastLetterIfNumber = (str) => {
  // Check if the last character is a letter and the second-to-last is a number
  if (/[a-zA-Z]/.test(str[str.length - 1]) && /\d/.test(str[str.length - 2])) {
    return str.slice(0, -1); // Remove the last letter
  }
  return str;
};
