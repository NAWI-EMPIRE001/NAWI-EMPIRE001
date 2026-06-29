# NAWI-EMPIRE001 Deployment Guide

## Production Stack

- Node.js
- Express
- MongoDB Atlas
- Render
- Socket.IO

---

# Environment Variables

```env
PORT=10000

NODE_ENV=production

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret

JWT_EXPIRE=30d

CLIENT_URL=https://yourfrontend.com

EMAIL_USER=

EMAIL_PASSWORD=
```

---

# Install Dependencies

```bash
npm install
```

---

# Run Development

```bash
npm run dev
```

---

# Run Production

```bash
npm start
```

---

# Run Tests

```bash
npm test
```

---

# Deploy to Render

1. Connect GitHub repository.
2. Select Web Service.
3. Add Environment Variables.
4. Deploy.

---

# Health Check

```text
GET /health
```

Expected Response:

```json
{
  "success": true,
  "status": "HEALTHY"
}
```