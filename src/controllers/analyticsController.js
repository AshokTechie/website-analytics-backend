import Event from "../models/Event.js";

// POST /api/analytics/collect
export const collectEvent = async (req, res) => {
  try {
    const { event, url, referrer, device, ipAddress, timestamp, metadata, userId } = req.body;

    if (!event) return res.status(400).json({ message: "event field is required" });

    const doc = new Event({
      appId: req.appId,
      event,
      userId,
      url,
      referrer,
      device: device || "desktop",
      ipAddress,
      metadata,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await doc.save();
    res.status(201).json({ message: "Event collected successfully" });
  } catch (err) {
    console.error("collectEvent error:", err);
    res.status(500).json({ message: "Failed to collect event", error: err.message });
  }
};

// GET /api/analytics/event-summary
export const getEventSummary = async (req, res) => {
  try {
    const { event, startDate, endDate, app_id } = req.query;

    if (!event) return res.status(400).json({ message: "event query parameter is required" });

    const query = { event };

    if (app_id) {
      query.appId = app_id;
    } else {
      query.appId = req.appId;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate + "T23:59:59Z");
    }

    const events = await Event.find(query);
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;

    const deviceData = {};
    events.forEach(e => {
      deviceData[e.device] = (deviceData[e.device] || 0) + 1;
    });

    res.json({
      event,
      count: events.length,
      uniqueUsers,
      deviceData,
    });
  } catch (err) {
    console.error("getEventSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analytics/user-stats
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ message: "userId query parameter is required" });

    const events = await Event.find({ userId, appId: req.appId }).sort({ timestamp: -1 });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this user" });
    }

    const recentEvent = events[0];

    res.json({
      userId,
      totalEvents: events.length,
      deviceDetails: {
        browser: recentEvent.metadata?.browser || "Unknown",
        os: recentEvent.metadata?.os || "Unknown",
      },
      ipAddress: recentEvent.ipAddress || "Unknown",
    });
  } catch (err) {
    console.error("getUserStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
