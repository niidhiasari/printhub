# 3D Printer Dashboard

A full-stack web application for managing 3D printers, print jobs, and maintenance schedules.

## Features

- Real-time printer status monitoring
- Print job management and queue
- Maintenance scheduling and tracking
- User authentication and authorization
- Responsive dashboard interface

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Validator

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd printer-dashboard
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create environment files:

Backend (.env):
```
MONGODB_URI=your_mongodb_uri
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Printers
- GET /api/printers - Get all printers
- POST /api/printers - Add a new printer
- GET /api/printers/:id - Get printer details
- PUT /api/printers/:id - Update printer
- DELETE /api/printers/:id - Delete printer

### Print Jobs
- GET /api/jobs - Get all print jobs
- POST /api/jobs - Create a new print job
- GET /api/jobs/:id - Get job details
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job

### Maintenance
- GET /api/maintenance - Get all maintenance records
- POST /api/maintenance - Create maintenance record
- GET /api/maintenance/:id - Get maintenance details
- PUT /api/maintenance/:id - Update maintenance record
- DELETE /api/maintenance/:id - Delete maintenance record

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 