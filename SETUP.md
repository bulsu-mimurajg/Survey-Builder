# Survey Builder - sixsayvensurvey.io

A comprehensive survey platform built with Django (backend) and React (frontend) that empowers students and teachers with real-time survey analytics.

## 🏗️ Project Structure

```
Survey-Builder/
├── DjangoProject/          # Django backend
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── frontend/               # React frontend with Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── package.json
└── manage.py
```

## 📋 Prerequisites

### Backend Requirements
- **Python 3.8+**
- **pip** (Python package manager)
- **virtualenv** (recommended)

### Frontend Requirements
- **Node.js 18+** (Download from https://nodejs.org/)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### 1. Backend Setup (Django)

```powershell
# Navigate to project root
cd d:\Desktop\sixsayvensurvey\Survey-Builder

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Django and dependencies
pip install django
pip install django-cors-headers

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

Django will run at: http://localhost:8000

### 2. Frontend Setup (React + Tailwind + shadcn/ui)

```powershell
# Navigate to frontend directory
cd d:\Desktop\sixsayvensurvey\Survey-Builder\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: http://localhost:5173

## 🎨 Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component system
- **React Router** - Client-side routing

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API development (to be added)
- **SQLite** - Database (development)
- **django-cors-headers** - CORS handling

## 📁 Key Files Created

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/
│   │   └── LandingPage.jsx       # Main landing page
│   ├── components/
│   │   └── ui/
│   │       └── button.jsx         # Reusable button component
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles with Tailwind
├── index.html                     # HTML template
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.js                 # Vite configuration
└── package.json                   # Dependencies
```

## 🎯 Features

### Landing Page
- ✅ Responsive navigation header
- ✅ Hero section with compelling copy
- ✅ Visual component showcase
- ✅ Call-to-action buttons
- ✅ Modern gradient design matching brand
- ✅ Mobile-responsive layout

### Coming Soon
- 🔄 User authentication (Sign In/Sign Up)
- 🔄 Survey builder interface
- 🔄 Survey response collection
- 🔄 Real-time analytics dashboard
- 🔄 Role-based access (Students/Teachers)

## 🛠️ Development Commands

### Frontend
```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```powershell
python manage.py runserver        # Start server
python manage.py makemigrations   # Create migrations
python manage.py migrate          # Apply migrations
python manage.py createsuperuser  # Create admin user
python manage.py test             # Run tests
```

## 🎨 Design System

### Colors
- **Primary (Indigo)**: `#6366F1` - Main brand color
- **Purple**: `#A855F7` - Accent color
- **Pink**: `#EC4899` - Secondary accent

### Typography
- **Headings**: Bold, large scale
- **Body**: System fonts for readability

## 📝 Next Steps

1. **Install dependencies** following the installation section above
2. **Start both servers** (Django backend + React frontend)
3. **Access the landing page** at http://localhost:5173
4. **Begin customizing** the components and pages

## 🤝 Contributing

This is a project for sixsayvensurvey.io. For questions or contributions, please contact the development team.

## 📄 License

Proprietary - All rights reserved
