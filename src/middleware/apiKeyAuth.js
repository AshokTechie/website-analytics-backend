import ApiKey from "../models/ApiKey.js";

export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ message: "API key required in x-api-key header" });

    const found = await ApiKey.findOne({ apiKey, revoked: false });
    if (!found) return res.status(401).json({ message: "Invalid or revoked API key" });

    if (found.expiresAt && new Date() > found.expiresAt) {
      return res.status(401).json({ message: "API key expired" });
    }

    req.appId = found._id;
    req.ownerEmail = found.ownerEmail;
    next();
  } catch (err) {
    console.error("validateApiKey error:", err);
    res.status(500).json({ message: "Authentication error" });
  }
};
