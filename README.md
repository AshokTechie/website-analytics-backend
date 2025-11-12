# Website Analytics Backend

A robust, production-ready Node.js backend service for collecting and analyzing website analytics data. Built with Express.js, MongoDB, and Redis for high performance and scalability.

## 🚀 Features

- **Event Collection**: Collect custom analytics events from websites with detailed metadata
- **API Key Authentication**: Secure endpoints using API key-based authentication
- **Event Summaries**: Aggregate event data with device breakdown and unique user counting
- **User Statistics**: Track individual user activity and device information
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **Google Authentication**: OAuth 2.0 integration for user authentication
- **API Key Management**: Generate, revoke, and regenerate API keys with optional expiration
- **RESTful API**: Clean, intuitive REST endpoints with proper HTTP status codes
- **Security**: Helmet.js for HTTP security headers, CORS support
- **Logging**: Morgan integration for request logging
- **Error Handling**: Comprehensive error handling with meaningful error messages

## 📋 Prerequisites

- **Node.js** v16 or higher
- **MongoDB** v4.4 or higher (local or cloud instance)
- **Redis** v6.0 or higher (optional but recommended for rate limiting)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd website-analytics-backend
   ```

2. **Install dependencies**
   ```bash
   cd website-analytics-backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `website-analytics-backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/analyticsdb
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Ensure MongoDB and Redis are running**
   ```bash
   # MongoDB (if running locally)
   mongod
   
   # Redis (if running locally)
   redis-server
   ```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
Runs with `nodemon` for automatic restart on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Health Check
```http
GET /health
```
Response:
```json
{ "status": "ok" }
```

### Authentication Routes (`/api/auth`)

#### 1. Google Authentication
```http
POST /api/auth/google
Content-Type: application/json

{
  "googleId": "google_id_string",
  "email": "user@example.com",
  "name": "User Name"
}
```
Response: `201 Created`
```json
{
  "message": "Authenticated successfully",
  "userId": "user_id",
  "email": "user@example.com"
}
```

#### 2. Register App
```http
POST /api/auth/register
Content-Type: application/json

{
  "appName": "my-app",
  "ownerEmail": "owner@example.com",
  "expiresInDays": 90
}
```
Response: `201 Created`
```json
{
  "message": "Registered successfully",
  "apiKey": "generated_api_key_here",
  "appName": "my-app"
}
```

#### 3. Get API Key
```http
GET /api/auth/api-key?appName=my-app&ownerEmail=owner@example.com
```
Response: `200 OK`
```json
{
  "appName": "my-app",
  "apiKey": "your_api_key",
  "revoked": false,
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

#### 4. Revoke API Key
```http
POST /api/auth/revoke
Content-Type: application/json

{
  "apiKey": "api_key_to_revoke"
}
```
Or by app details:
```json
{
  "appName": "my-app",
  "ownerEmail": "owner@example.com"
}
```

#### 5. Regenerate API Key
```http
POST /api/auth/regenerate
Content-Type: application/json

{
  "apiKey": "current_api_key"
}
```

### Analytics Routes (`/api/analytics`)

**All analytics endpoints require API key authentication via the `x-api-key` header**

#### 1. Collect Event
```http
POST /api/analytics/collect
x-api-key: your_api_key
Content-Type: application/json

{
  "event": "page_view",
  "url": "https://example.com/page",
  "referrer": "https://google.com",
  "device": "desktop",
  "ipAddress": "192.168.1.1",
  "userId": "user123",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "browser": "Chrome",
    "os": "Windows",
    "screenSize": "1920x1080"
  }
}
```
Response: `201 Created`
```json
{
  "message": "Event collected successfully"
}
```

#### 2. Get Event Summary
```http
GET /api/analytics/event-summary?event=page_view&startDate=2024-01-01&endDate=2024-01-31
x-api-key: your_api_key
```
Response: `200 OK`
```json
{
  "event": "page_view",
  "count": 150,
  "uniqueUsers": 45,
  "deviceData": {
    "desktop": 100,
    "mobile": 40,
    "tablet": 10
  }
}
```

#### 3. Get User Statistics
```http
GET /api/analytics/user-stats?userId=user123
x-api-key: your_api_key
```
Response: `200 OK`
```json
{
  "userId": "user123",
  "totalEvents": 25,
  "deviceDetails": {
    "browser": "Chrome",
    "os": "Windows"
  },
  "ipAddress": "192.168.1.1"
}
```

## 🏗️ Project Structure

```
website-analytics-backend/
├── src/
│   ├── app.js                          # Express app setup
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   └── redis.js                    # Redis configuration
│   ├── controllers/
│   │   ├── analyticsController.js      # Analytics logic
│   │   └── authController.js           # Auth logic
│   ├── middleware/
│   │   └── apiKeyAuth.js               # API key validation
│   ├── middlewares/
│   │   ├── authMiddleware.js           # Additional auth middleware
│   │   └── rateLimiter.js              # Redis rate limiter
│   ├── models/
│   │   ├── ApiKey.js                   # API Key schema
│   │   └── Event.js                    # Event schema
│   ├── routes/
│   │   ├── authRoutes.js               # Auth endpoints
│   │   └── analyticsRoutes.js          # Analytics endpoints
│   └── utils/
│       └── generateApiKey.js           # API key generation
├── .env                                # Environment variables
├── package.json                        # Dependencies
└── README.md                           # This file
```

## 🔐 Security Features

- **API Key Authentication**: All analytics endpoints require valid, non-revoked API keys
- **Rate Limiting**: Redis-based rate limiting (100 requests per 60 seconds per IP)
- **Helmet.js**: HTTP security headers protection
- **CORS**: Cross-Origin Resource Sharing configured
- **Input Validation**: Request validation on critical endpoints
- **API Key Expiration**: Optional expiration dates for API keys
- **Request Size Limit**: 1MB limit on JSON payloads

## 🚢 Deployment

### Using Docker

The project includes Docker configuration for easy deployment:

```bash
docker-compose up -d
```

### Using Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy

**Live Deployment URL**: (Add your deployment URL here after deployment)

Example: `https://your-app.onrender.com`

## 📊 Database Schema

### Event Schema
```javascript
{
  appId: ObjectId,              // Reference to ApiKey
  event: String,                // Event name (indexed)
  userId: String,               // User identifier (indexed)
  url: String,                  // Page URL
  referrer: String,             // Referrer URL
  device: String,               // "mobile" | "desktop" | "tablet"
  ipAddress: String,            // Client IP
  metadata: {
    browser: String,
    os: String,
    screenSize: String
  },
  timestamp: Date,              // Event time (indexed, default: now)
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

### ApiKey Schema
```javascript
{
  appName: String,              // Application name (required)
  ownerEmail: String,           // Owner's email
  googleId: String,             // Google OAuth ID (unique, sparse)
  apiKey: String,               // API key (unique, required)
  revoked: Boolean,             // Revocation status
  expiresAt: Date,              // Expiration date (optional)
  createdAt: Date               // Creation timestamp
}
```

## 🎯 Key Challenges & Solutions

### Challenge 1: Rate Limiting at Scale
**Problem**: Default in-memory rate limiting doesn't work across multiple instances.

**Solution**: Implemented Redis-based rate limiting using `redis` client with atomic increments and expiration windows. This ensures consistent rate limiting across distributed systems.

### Challenge 2: API Key Management
**Problem**: Secure management of API keys with expiration and revocation.

**Solution**: 
- Unique, cryptographically secure API keys generated using Node's `crypto` module
- Optional expiration dates stored in database
- Middleware checks both validity and expiration before processing requests
- Keys can be revoked without deletion for audit trails

### Challenge 3: Multi-tenancy Support
**Problem**: Isolating data between different applications/users.

**Solution**: Each request is tied to an `appId` derived from the API key. All queries are filtered by this `appId` to ensure data isolation.

### Challenge 4: Performance Optimization
**Problem**: Aggregating large datasets for summaries could be slow.

**Solution**:
- Added MongoDB indexes on frequently queried fields (`appId`, `event`, `userId`, `timestamp`)
- Efficient in-memory aggregation for device data
- Used database queries rather than fetching all records into application memory

### Challenge 5: Error Handling
**Problem**: Inconsistent error messages and status codes.

**Solution**:
- Centralized error handling in Express middleware
- Meaningful error messages for debugging
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Request logging with Morgan

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | mongodb://127.0.0.1:27017/analyticsdb |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | your_jwt_secret_key |

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- Verify connection permissions

### Redis Connection Failed
- Ensure Redis is running: `redis-server`
- Check `REDIS_URL` in `.env`
- Redis is optional; app will warn but continue

### Rate Limiter Not Working
- Verify Redis is running
- Check Redis connectivity
- Monitor Redis logs for errors

### API Key Invalid
- Ensure `x-api-key` header is set correctly
- Verify API key hasn't been revoked
- Check API key expiration date

## 🚀 Future Enhancements

- [ ] Dashboard for analytics visualization
- [ ] Advanced filtering and segmentation
- [ ] Webhook support for real-time events
- [ ] Data export (CSV, JSON)
- [ ] Custom event schemas
- [ ] Webhook-based data ingestion
- [ ] Real-time analytics with WebSockets
- [ ] Admin panel for key management
- [ ] Usage metrics and billing

## 📄 License

ISC

## 👥 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Last Updated**: January 2024
