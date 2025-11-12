import crypto from "crypto";

const generateApiKey = () => {
  return crypto.randomBytes(20).toString("hex");
};

export default generateApiKey;
