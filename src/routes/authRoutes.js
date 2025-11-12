import express from "express";
import { googleAuth, registerApp, getApiKey, revokeApiKey, regenerateApiKey } from "../controllers/authController.js";

const router = express.Router();

// Google Auth
router.post("/google", googleAuth);

// Register a new app and receive API key
router.post("/register", registerApp);

// Retrieve API key for an app (by appName and optional ownerEmail)
router.get("/api-key", getApiKey);

// Revoke an API key
router.post("/revoke", revokeApiKey);

// Regenerate an API key (revokes old one)
router.post("/regenerate", regenerateApiKey);

export default router;

