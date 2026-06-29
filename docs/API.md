# NAWI-EMPIRE001 API Documentation

## Base URL

```text
https://your-domain.com/api/v1
```

---

# Authentication

## Register

POST `/auth/register`

### Body

```json
{
  "username": "empireuser",
  "email": "user@example.com",
  "password": "Password123!"
}
```

---

## Login

POST `/auth/login`

---

# Profile

GET `/profile/me`

PUT `/profile/update`

---

# Wallet

GET `/wallet`

POST `/wallet/deposit`

POST `/wallet/withdraw`

---

# Escrow

POST `/escrow/create`

POST `/escrow/release`

POST `/escrow/refund`

---

# Marketplace

GET `/marketplace`

POST `/marketplace/create`

---

# Streams

GET `/streams`

POST `/streams/create`

---

# Messages

GET `/messages`

POST `/messages/send`

---

# Verification

POST `/verification/request`