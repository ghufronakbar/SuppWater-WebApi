/**
 * Format string
 * @param str - String yang akan diformat
 * @param maxLength - Batas panjang string yang diinginkan
 * @return String yang telah diformat
 * @example formatString("Hello World", 5) // "Hello..."
 */

const formatString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "...";
  }
  return str;
};

export default formatString;
