# Blogging Platform

A full-stack blogging platform built with **MERN stack** and **TailwindCSS**.  
Includes authentication, post management, comments, profile pages, and responsive design.  

---

##  Features
-  User Authentication (Register, Login, Logout)
-  Home Page with post listings
-  Post Detail Page with comments
-  Create & Edit Posts
-  User Profile with post history
-  Responsive UI with TailwindCSS

---

## How to Test

### Authentication
1. Open the app → you’ll see the **Login** page.  
2. Click **Register** → create a new account.  
3. After registering, you’ll be redirected to the **Home Page**.  
4. Logout → then login again with the same credentials.  

### Home Page
1. See a list of **posts in cards** (title, excerpt, author, tags).  
2. On **desktop** → cards appear in a grid.  
3. On **mobile** → cards stack vertically (responsive).  
4. Click **“Read More”** on any post → opens **Post Detail Page**.  

### Post Detail Page
1. Shows full content, author, date, and tags.  
2. Scroll down → view **comments section**.  
3. Add a new comment → it appears instantly.  

### Create Post
1. Go to **Create Post** from the navbar.  
2. Enter title, content, and tags.  
3. Submit → new post appears on Home Page.  

### Profile Page
1. Open **Profile** from the navbar.  
2. Shows user details (name, email, joined date).  
3. Displays posts created by the user.  

### Responsiveness
- Open the app on **desktop + mobile (or resize browser)**:  
  - Navbar adjusts.  
  - Cards stack properly.  
  - Pages remain readable and neat.  

---

## Tech Stack
- **Frontend**: React, React Router, TailwindCSS  
- **Backend**: Node.js, Express.js, MongoDB, Mongoose  
- **Deployment**: Netlify (frontend) + Render (backend)  

---

## Notes
- React Router warnings about `future` flags may appear in console — they are safe to ignore.  
- Fully tested on both desktop and mobile.  

---
  
