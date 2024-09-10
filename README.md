# Online Bookstore with Integrated AI Chatbot

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Installation & Setup](#4-installation--setup)

## 1. Project Overview

The **Online Bookstore** is an ecommerce platform where customers can browse books, add them to a shopping cart, complete purchases, and place orders. Administrators are provided with tools to manage the book inventory, ship/cancel orders, and oversee the entire bookstore operation. Additionally, a robot chat feature using **LangChain** and a **Large Language Model (LLM)** offers customers real-time assistance with inquiries, book availability, and order statuses.

## 2. Features

### Role-based Authentication
- Secure login and registration for both customers and administrators using **JWT** for authentication.

### Customer Features:
- **Online Browsing**: Search books by title, author, or ISBN; filter by categories; sort by title, price, or new arrivals. View detailed book descriptions and customer reviews.
- **Online Ordering**: Add books to the shopping cart, proceed to checkout, and place orders.
- **Wishlist**: Save books for future purchases.
- **Book Reviews**: Leave reviews and ratings for purchased books.
- **AI Chatbot**: Receive assistance with general inquiries, book availability, and order status via the AI-powered chatbot.

### Admin Features:
- **Inventory Management**: Manage book inventory by adding, updating, and tracking stock levels.
- **Order Management**: Ship or cancel customer orders.

## 3. Technology Stack

The project is built using **TypeScript** for both the frontend and backend.

- **Frontend**: React, Material UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Chatbot**: LangChain, OpenAI API
- **Authentication**: JWT

## 4. Installation & Setup

1. **Clone the repository**:
   ```
   git clone https://github.com/XintangZ/ecommerce_bookstore.git
   cd ecommerce_bookstore
   ```

2. **Install Dependencies**:
   - For frontend:
     ```
     cd web
     npm install
     ```
     
   - For backend:
     ```
     cd server
     npm install
     ```

3. **Setup Environment Variables**:
   - **Frontend**: In the `web` folder, copy the `.env.example` file and configure the variables in the new `.env` file:
     ```
     cp web/.env.example web/.env
     ```
     
   - **Backend**: In the `server` folder, copy the `.env.example` file and configure the variables in the new `.env` file:
     ```
     cp server/.env.example server/.env
     ```
     
4. **Run the Application**:
   - Start the backend server:
     ```
     cd server
     npm run dev
     ```
     
   - Start the frontend:
     ```
     cd web
     npm run dev
     ```
