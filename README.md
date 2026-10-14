# Snippo - MERN Stack Code Snippet Manager

A full-stack code snippet manager built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Create and manage code snippets
- Multi-language support (JavaScript, TypeScript, Python, Go, Rust, HTML)
- User authentication (register/login)
- Persistent storage with MongoDB
- Modern, dark-themed UI

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository and navigate to the project directory

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

4. Configure environment variables:
   Create a `.env` file in the `server` directory with the following:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/snippo
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

## Running the Application

1. Start MongoDB (if running locally):

```bash
mongod
```

2. Start the backend server:

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

3. Start the frontend (in a new terminal):

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login
3. Create code snippets by entering a title and code
4. View and manage your recent snippets
5. Use keyboard shortcut `Ctrl/Cmd + Enter` to quickly save snippets

## Project Structure

```
snippo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Global styles
│   │   ├── api.js         # API client
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Express backend
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   └── Snippet.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   └── snippets.js
│   ├── middleware/        # Express middleware
│   │   └── auth.js
│   ├── index.js           # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info

### Snippets

- `GET /api/snippets` - Get all snippets for current user
- `POST /api/snippets` - Create a new snippet
- `DELETE /api/snippets/:id` - Delete a snippet

## Technologies Used

- **Frontend**: React, Vite, Axios
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS with CSS Variables
