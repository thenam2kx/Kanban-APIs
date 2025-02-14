const checkExpiredCode = (dateString: string): boolean => {
  const expirationDate = new Date(dateString);
  const currentDate = new Date();
  return currentDate < expirationDate;
};

export default checkExpiredCode;
