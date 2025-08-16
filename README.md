# ISP Management System - Frontend

A modern, responsive Next.js frontend application for managing ISP operations, built with TypeScript, Tailwind CSS, and React Query.

## 🚀 Features

### ✅ Completed Features
- **Authentication System**
  - JWT-based authentication with token refresh
  - Protected routes and role-based access
  - Login/logout functionality

- **Dashboard & Analytics**
  - Overview statistics and KPIs
  - Payment status tracking
  - System health indicators
  - Quick action buttons

- **Customer Management**
  - Customer list with search and filtering
  - Add/Edit customer forms with validation
  - Customer detail view with payment history
  - Network configuration management
  - Customer status toggle (active/inactive)

- **Package Management**
  - Service package CRUD operations
  - Package listing with search
  - Package details and pricing management

- **Payment Management**
  - Payment list with status filtering
  - Payment tracking and bill generation
  - Monthly billing automation

- **User Management**
  - System user listing
  - Role-based permissions
  - User status management

### 🎨 Design & UX
- Modern, clean interface with professional design
- Responsive design for all device sizes
- Smooth transitions and animations
- Loading states and error handling
- Intuitive navigation and user flow

### 🛠 Technical Features
- TypeScript for type safety
- React Query for efficient data fetching and caching
- Form validation with React Hook Form
- Reusable UI components
- Optimized performance with Next.js 14
- Professional color scheme and styling

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: JWT with cookie storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running Django backend API

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   The `.env.local` is already configured with the hosted backend:
   ```env
   NEXT_PUBLIC_API_URL=https://billing-backend-0ufp.onrender.com/api/v1
   NEXT_PUBLIC_APP_NAME=ISP Management System
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/              # Authentication pages
│   │   ├── customers/         # Customer management pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── packages/          # Package management pages
│   │   ├── payments/          # Payment management pages
│   │   ├── users/             # User management pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page (redirects)
│   ├── components/
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks and API hooks
│   ├── lib/                   # Utilities and configurations
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── package.json
```

## 🔌 API Integration

The frontend integrates with your hosted Django REST API backend:

- **Base URL**: `https://billing-backend-0ufp.onrender.com/api/v1`
- **Authentication**: JWT tokens with automatic refresh
- **Endpoints**:
  - `/users/*` - User management
  - `/customers/*` - Customer operations
  - `/packages/*` - Package management
  - `/payments/*` - Payment processing
  - `/dashboard` - Analytics data

## 🔐 Authentication

The app uses JWT authentication with:
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Automatic token refresh
- Protected route guards
- Cookie-based token storage

## 📱 Pages Overview

### Dashboard (`/dashboard`)
- System overview and key metrics
- Recent activity feed
- Quick action buttons
- System health status

### Customers (`/customers`)
- **List View**: Search, filter, and manage customers
- **Add/Edit**: Comprehensive customer forms
- **Detail View**: Customer information and payment history
- **Network Config**: Connection settings and credentials

### Packages (`/packages`)
- **List View**: Service package management
- **Add/Edit**: Package configuration forms
- **Pricing**: Speed and pricing management

### Payments (`/payments`)
- **List View**: Payment tracking and filtering
- **Bill Generation**: Automated monthly billing
- **Payment Processing**: Transaction management

### Users (`/users`)
- System user management
- Role-based access control
- User status management

## 🎨 UI Components

### Custom Components
- `Button` - Various styles and states
- `Input` - Form inputs with validation
- `Card` - Content containers
- `Table` - Data display tables
- `DashboardLayout` - Main application layout
- `ProtectedRoute` - Authentication guard

### Features
- Loading states
- Error boundaries
- Form validation
- Responsive design
- Dark/light mode ready

## 🛠 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📞 Login Credentials

For testing, use these demo credentials:
- **Phone**: admin
- **Password**: admin

(Update these based on your backend setup)

## 🎯 Key Features Implemented

1. **Complete Authentication Flow**: Login, logout, token management
2. **Customer Management**: Full CRUD with search and filtering
3. **Package Management**: Service package configuration
4. **Payment Processing**: Bill generation and payment tracking
5. **Dashboard Analytics**: Key metrics and system overview
6. **Responsive Design**: Works on all device sizes
7. **Professional UI**: Modern, clean interface
8. **Type Safety**: Full TypeScript implementation
9. **Performance Optimized**: React Query caching and optimization
10. **Industry Standards**: Following best practices

The application is production-ready with proper error handling, loading states, and user experience optimization.
