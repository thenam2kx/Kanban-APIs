const generateCode = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000);
  return activationCode.toString();
};

export default generateCode;
