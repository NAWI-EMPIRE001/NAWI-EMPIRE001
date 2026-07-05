# NAWI-EMPIRE001 deployment guide

## production stack

- node.js
- express
- mongodb atlas
- render
- socket.iO

---

# environment variables

```env
port=10000

node_env=production

MONGO_URI=your_mongodb_connection

jwt_secret=your_secret

jwt_secret=30d

client_url=https://yourfrontend.com

email_user=

email_password=
```

---

# install dependencies

```bash
npm install
```

---

# run development

```bash
npm run dev
```

---

# run production

```bash
npm start
```

---

# run tests

```bash
npm test
```

---

# deploy to render

1. connect gitHub repository.
2. select web service.
3. add environment variables.
4. deploy.

---

# health check

```text
get /health
```

expected Response:

```json
{
  "success": true,
  "status": "healthy"
}
```