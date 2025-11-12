import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
    },
    userId: { type: String, index: true },
    url: String,
    referrer: String,
    device: {
      type: String,
      enum: ["mobile", "desktop", "tablet"],
      default: "desktop",
    },
    ipAddress: String,
    metadata: {
      browser: String,
      os: String,
      screenSize: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
