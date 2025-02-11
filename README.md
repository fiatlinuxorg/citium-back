# 🏗Citium - Backend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Framework](https://img.shields.io/badge/framework-AdonisJS-purple)
![Database](https://img.shields.io/badge/database-MongoDB-green)

Innovative web platform for monitoring small construction sites in the city of Trento. This repository contains the backend services responsible for authentication, user management, construction site data, and real-time notifications.

## 🚀 Features

- 🔐 **Authentication & Authorization** – Secure stateful API authentication using MongoDB.
- 🏗 **Construction Site Management** – CRUD operations for managing construction sites.
- 🔔 **Real-time Notifications** – Subscription system for users to receive updates on construction sites.
- 📊 **API Documentation** – Fully documented REST APIs.
- 📦 **Scalability** – Built with AdonisJS for a modular and maintainable backend.

## 🛠️ Tech Stack

- **Framework**: AdonisJS
- **Database**: MongoDB
- **Authentication**: Stateless authentication with JWT

## 🚀 Getting Started

### 1️⃣ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (>= 22.x)
- [MongoDB](https://www.mongodb.com/)
- [NPM](https://www.npmjs.com/)

### 2️⃣ Installation

```bash
git clone https://github.com/fiatlinuxorg/citium.git
cd citium
```

Install dependencies:

```bash
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the root directory and configure your environment variables:

```
TZ=UTC
PORT=8000
HOST=localhost
LOG_LEVEL=info
APP_KEY=YOUR_APP_KEY
NODE_ENV=development
SESSION_DRIVER=cookie
MONGO_URI='mongodb://localhost:27017/citium'
JWT_SECRET=YOUR_SECRET_KEY
```

### 4️⃣ Run the Backend Server

development:

```bash
npm run dev
```

production:

```bash
npm run build
cd build
npm ci --omit="dev"
node bin/server.js
```

The API will be available at `http://localhost:8000`.

## 📖 API Documentation

API documentation is available via Swagger:

```
http://localhost:8000/docs
```

## 🛡️ Security Considerations

- **JWT Authentication**: Protecting API endpoints
- **CORS**: Configured to allow secure cross-origin requests

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

💡 _Building a smarter city, one construction site at a time!_
