import ApiKey from "../models/ApiKey.js";

/**
 * Middleware to verify API key in headers
 * Header format:  x-api-key: <your_api_key>
 */
export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey)
      return res.status(401).json({ message: "Missing API key in headers" });

    const keyDoc = await ApiKey.findOne({ apiKey, revoked: false });

    if (!keyDoc)
      return res.status(403).json({ message: "Invalid or revoked API key" });

    if (keyDoc.expiresAt && keyDoc.expiresAt < new Date())
      return res.status(403).json({ message: "API key has expired" });

    // attach app info to request for later use
    req.appInfo = {
      appName: keyDoc.appName,
      apiKey: keyDoc.apiKey,
    };

    next(); // allow the request to continue
  } catch (err) {
    console.error("API Key verification failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
