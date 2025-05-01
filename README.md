
# 📝 Blogi – Blogging Platform

**Blogi** is a full-stack blogging platform built with **FastAPI** (Python) for the backend and **Next.js** (React) for the frontend. It allows users to register, log in, and manage blog posts with features like image uploads, pagination, search, and JWT-based authentication.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://blogiblog-website.vercel.app](https://blogiblog-website.vercel.app)
- **Backend (Render)**: [https://blogi-the-blog-website.onrender.com](https://blogi-the-blog-website.onrender.com)
- **API Docs**: [https://blogi-the-blog-website.onrender.com/docs](https://blogi-the-blog-website.onrender.com/docs)

---

## 🛠️ Tech Stack

### 🔹 Backend
- **Python**, **FastAPI**
- **PostgreSQL** (hosted on Render)
- **SQLAlchemy** (ORM)
- **PyJWT** and **python-jose** for JWT auth
- **Docker** support
- **Uvicorn** ASGI server

### 🔹 Frontend
- **Next.js** (React Framework)
- **Tailwind CSS** for UI
- **Axios** for API requests
- **JWT handling** using `localStorage`

---

## 📦 Features

### ✅ Authentication
- User **registration** (`/register`)
- User **login** (`/login`)
- JWT token issuance and verification
- **Logout** (clears token from storage)

### ✅ Blog Posts (CRUD)
- Create, read, update, delete your own posts
- Each post includes: **title**, **content**, **author**, **created & updated timestamps**
- Posts are sorted by **most recent first**

### ✅ Image Uploads
- Upload and attach images to blog posts
- Images are stored and served via FastAPI static files

### ✅ Pagination & Search
- Paginate posts with `limit` and `skip` query params
- Search blog posts by **title** or **content** using query parameters

---

## 🔧 Installation

### Backend Setup

```bash
git clone https://github.com/Omkar-Abhang/Blogi-The-Blog-Website/tree/master/blogi_backend
cd blogi_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Edit with your DB URL, SECRET_KEY, etc.

# Run locally
uvicorn main:app --reload
```

### Frontend Setup

```bash
git clone https://github.com/Omkar-Abhang/Blogi-The-Blog-Website/tree/master/blogi-blog_website
cd blogi-blog_website

# Install dependencies
npm install

# Set up .env.local file
cp .env.example .env.local
# Add NEXT_PUBLIC_API_URL=https://blogi-the-blog-website.onrender.com

# Run locally
npm run dev
```

---

## 🐳 Docker

You can run the backend using Docker:

```bash
docker build -t blogi_backend .
docker run -d -p 8000:8000 blogi_backend
```

---



---

## 🌐 API Endpoints Overview

### Auth
- `POST /register` – Register new user
- `POST /login` – Get JWT token
- `GET /users/me` – Get logged-in user info

### Posts
- `POST /posts/` – Create new post
- `GET /posts/` – List all posts (supports `?search=&limit=&skip=`)
- `GET /posts/{id}` – Get single post
- `PUT /posts/{id}` – Update post
- `DELETE /posts/{id}` – Delete post
- `POST /posts/{id}/upload-image` – Upload image for a post

---





## 📝 License

This project is licensed under the **MIT License**.

---

## 👤 Author

- **Omkar Abhang**  
  [GitHub](https://github.com/Omkar-Abhang) | [LinkedIn](https://www.linkedin.com/in/omkar-abhang-586236250/)

```

