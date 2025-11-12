import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  appName: { type: String, required: true },
  ownerEmail: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  apiKey: { type: String, required: true, unique: true },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// add an index to allow querying by appName + ownerEmail quickly
apiKeySchema.index({ appName: 1, ownerEmail: 1 });
apiKeySchema.index({ googleId: 1 });

export default mongoose.model("ApiKey", apiKeySchema);
