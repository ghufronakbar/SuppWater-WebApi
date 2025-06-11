# API Documentation

## Authentication

### POST /api/login
**Description:** Login with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
- 200 OK
```json
{
  "status": 200,
  "message": "Berhasil login",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "User|Seller|Admin",
    "picture": "string|null",
    ...,
    "accessToken": "string"
  }
}
```
- 400/401/500 Error

---

### POST /api/register
**Description:** Register a new user or seller.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "User|Seller",
  "name": "string"
}
```

**Response:**
- 200 OK
```json
{
  "status": 200,
  "message": "Berhasil registrasi",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "User|Seller",
    "picture": "string|null",
    ...,
    "accessToken": "string"
  }
}
```
- 400/500 Error

---

## Image Upload

### POST /api/image
**Description:** Upload an image file (multipart/form-data).

**Request:**
- Form field: `image` (file)

**Response:**
- 200 OK
```json
{
  "message": "Berhasil upload gambar",
  "data": {
    "asset_id": "string",
    "public_id": "string",
    "secure_url": "string",
    ...
  }
}
```
- 500 Error

---

## User APIs

### GET /api/user/dashboard
**Description:** Get user dashboard data (currently returns empty object).

**Response:**
- 200 OK
```json
{}
```

---

### /api/user/account

#### GET /api/user/account
**Description:** Get user profile (requires authentication).

**Response:**
- 200 OK
```json
{
  "message": "Success",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "User",
    "picture": "string|null",
    "orders": [...],
    "transactions": [...],
    "products": [...],
    ...
  }
}
```
- 404/500 Error

#### PUT /api/user/account
**Description:** Edit user profile.

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "picture": "string|null"
}
```

**Response:**
- 200 OK
```json
{
  "message": "Berhasil mengedit profile",
  "data": {
    ...user,
    "accessToken": "string"
  }
}
```
- 400/500 Error

#### PATCH /api/user/account
**Description:** Change user password.

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response:**
- 200 OK
```json
{
  "message": "Berhasil mengganti password"
}
```
- 400/404/500 Error

---

#### GET /api/user/account/auth
**Description:** Check user authentication (returns decoded user info).

**Response:**
- 200 OK
```json
{
  "message": "Authorized",
  "data": { ...decodedUser }
}
```
- 500 Error

---

### /api/user/products

#### GET /api/user/products
**Description:** Get all products (not deleted).

**Response:**
- 200 OK
```json
{
  "message": "Success",
  "data": [ { ...product, user: { ... } }, ... ]
}
```

#### GET /api/user/products/[id]
**Description:** Get product by ID.

**Response:**
- 200 OK
```json
{
  "message": "Success",
  "data": { ...product, user: { ... } }
}
```
- 404 Error

---

### /api/user/orders

#### GET /api/user/orders
**Description:** Get all user orders.

**Response:**
- 200 OK
```json
{
  "message": "Success",
  "data": [ { ...order, user: { ... }, orderItems: [ ... ] }, ... ]
}
```

#### POST /api/user/orders
**Description:** Create a new order.

**Request Body:**
```json
{
  "latitude": number,
  "longitude": number,
  "location": "string",
  "orderItems": [
    { "productId": "string", "quantity": number }
  ]
}
```

**Response:**
- 200 OK
```json
{
  "message": "Berhasil membuat pesanan",
  "data": { ...order }
}
```
- 400/500 Error

#### GET /api/user/orders/[id]
**Description:** Get order by ID.

**Response:**
- 200 OK
```json
{
  "message": "Success",
  "data": { ...order, user: { ... }, orderItems: [ ... ] }
}
```
- 404/500 Error

#### PATCH /api/user/orders/[id]
**Description:** Mark order as completed (status: Selesai).

**Response:**
- 200 OK
```json
{
  "message": "Pesanan berhasil ditandai sebagai selesai"
}
```
- 400/404 Error

#### DELETE /api/user/orders/[id]
**Description:** Cancel order (status: Dibatalkan).

**Response:**
- 200 OK
```json
{
  "message": "Pesanan berhasil ditandai sebagai selesai"
}
```
- 400/404 Error
