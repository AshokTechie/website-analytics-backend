import ApiKey from "../models/ApiKey.js";
import generateApiKey from "../utils/generateApiKey.js";

// POST /api/auth/google - Google Auth callback
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    if (!googleId || !email) return res.status(400).json({ message: "googleId and email are required" });

    let user = await ApiKey.findOne({ googleId });
    if (!user) {
      user = new ApiKey({
        googleId,
        ownerEmail: email,
        appName: name || email.split("@")[0],
        apiKey: generateApiKey(),
      });
      await user.save();
    }

    res.json({ message: "Authenticated successfully", userId: user._id, email: user.ownerEmail });
  } catch (err) {
    console.error("googleAuth error:", err);
    res.status(500).json({ message: "Failed to authenticate", error: err.message });
  }
};

// POST /api/auth/register
// body: { appName, ownerEmail, expiresInDays? }
export const registerApp = async (req, res) => {
  try {
    const { appName, ownerEmail, expiresInDays } = req.body;
    if (!appName) return res.status(400).json({ message: "appName is required" });

    const apiKey = generateApiKey();

    const doc = new ApiKey({
      appName,
      ownerEmail,
      apiKey,
    });

    if (expiresInDays && Number(expiresInDays) > 0) {
      const d = new Date();
      d.setDate(d.getDate() + Number(expiresInDays));
      doc.expiresAt = d;
    }

    await doc.save();

    res.status(201).json({ message: "Registered successfully", apiKey, appName });
  } catch (err) {
    console.error("registerApp error:", err);
    res.status(500).json({ message: "Failed to register app", error: err.message });
  }
};

// GET /api/auth/api-key?appName=...&ownerEmail=...
export const getApiKey = async (req, res) => {
  try {
    const { appName, ownerEmail } = req.query;
    if (!appName) return res.status(400).json({ message: "appName query required" });

    const query = { appName };
    if (ownerEmail) query.ownerEmail = ownerEmail;

    const found = await ApiKey.findOne(query).sort({ createdAt: -1 });
    if (!found) return res.status(404).json({ message: "No API key found for given app" });

    res.json({ appName: found.appName, apiKey: found.apiKey, revoked: found.revoked, expiresAt: found.expiresAt });
  } catch (err) {
    console.error("getApiKey error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/revoke
// body: { apiKey } or { appName, ownerEmail }
export const revokeApiKey = async (req, res) => {
  try {
    const { apiKey, appName, ownerEmail } = req.body;
    let found = null;

    if (apiKey) {
      found = await ApiKey.findOne({ apiKey });
    } else if (appName) {
      const q = { appName };
      if (ownerEmail) q.ownerEmail = ownerEmail;
      found = await ApiKey.findOne(q).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: "Provide apiKey or appName" });
    }

    if (!found) return res.status(404).json({ message: "API key not found" });

    found.revoked = true;
    await found.save();

    res.json({ message: "API key revoked" });
  } catch (err) {
    console.error("revokeApiKey error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/regenerate
// body: { apiKey } or { appName, ownerEmail }
export const regenerateApiKey = async (req, res) => {
  try {
    const { apiKey, appName, ownerEmail } = req.body;
    let found = null;

    if (apiKey) {
      found = await ApiKey.findOne({ apiKey });
    } else if (appName) {
      const q = { appName };
      if (ownerEmail) q.ownerEmail = ownerEmail;
      found = await ApiKey.findOne(q).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: "Provide apiKey or appName" });
    }

    if (!found) return res.status(404).json({ message: "API key not found" });

    // Revoke old key
    found.revoked = true;
    await found.save();

    // Create new key
    const newKey = generateApiKey();
    const doc = new ApiKey({ appName: found.appName, ownerEmail: found.ownerEmail, apiKey: newKey });
    await doc.save();

    res.json({ message: "API key regenerated", apiKey: newKey });
  } catch (err) {
    console.error("regenerateApiKey error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
