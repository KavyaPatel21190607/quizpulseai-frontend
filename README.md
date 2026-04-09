# QuizPulse AI - Intelligent Learning Platform

A comprehensive, fully responsive AI-powered learning platform built with React, TypeScript, Tailwind CSS, and Motion (Framer Motion).

## Features

### 🎯 Complete Authentication System
- **Dual Role Support**: Separate login/signup flows for Students and Admins
- **Protected Routes**: Role-based access control with automatic redirects
- **Persistent Sessions**: LocalStorage-based session management
- **Logout Functionality**: Available in the sidebar navigation

### 📚 Student Features
- **Dashboard**: Comprehensive overview with statistics, recent quizzes, and progress tracking
- **AI Quiz Generator**: Upload study materials (PDF, DOCX, TXT) to generate personalized quizzes
- **Progress Predictor**: AI-powered insights and performance predictions
- **Study Resources**: Manage and access uploaded study materials
- **Profile Management**: View and edit user profile information

### 💬 Advanced Messaging System
- **WhatsApp-Style Interface**: Modern, familiar chat experience
- **Student Search**: Find and connect with other students
- **File Sharing**: Upload and share multiple file types:
  - Images (JPG, PNG, GIF)
  - Documents (PDF, DOCX, TXT)
  - Any file type supported
- **Real-time Features**:
  - Online/offline status indicators
  - Read receipts (single/double check marks)
  - Typing indicators
  - Message timestamps
- **Responsive Chat**: Mobile-optimized with slide-out drawer
- **File Preview**: Image previews in chat, document download options

### 👨‍💼 Admin Features
- **Admin Dashboard**: Platform-wide statistics and analytics
- **Student Management**: View and manage student accounts
- **Quiz Management**: Oversee quiz generation and performance
- **Analytics**: Detailed platform insights
- **Settings**: Configure platform settings

### 📱 Fully Responsive Design
- **Desktop**: Full sidebar navigation, multi-column layouts
- **Tablet**: Collapsible sidebar, optimized grid layouts
- **Mobile**:
  - Hamburger menu
  - Bottom navigation bar (students)
  - Touch-optimized interface
  - Mobile-first messaging experience

### 🎨 Modern UI/UX
- **Smooth Animations**: Motion-powered transitions and micro-interactions
- **Dark Mode Support**: Built-in dark/light theme compatibility
- **Gradient Accents**: Modern color schemes with purple/indigo gradients
- **Consistent Design System**: Cohesive components throughout

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing with protected routes
- **Tailwind CSS v4** - Utility-first styling
- **Motion (Framer Motion)** - Smooth animations
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open your browser to the local development URL

### Default Credentials

The application uses mock authentication. You can sign up with any email/password combination:

**Student Account:**
- Navigate to `/signup/student` or click "Get Started" on the landing page
- Fill in the registration form
- You'll be automatically logged in and redirected to the student dashboard

**Admin Account:**
- Navigate to `/signup/admin` or `/login/admin`
- Fill in the registration form
- You'll be automatically logged in and redirected to the admin dashboard

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Route protection wrapper
│   │   └── ui/                     # Reusable UI components
│   ├── context/
│   │   └── AuthContext.tsx         # Authentication state management
│   ├── layouts/
│   │   └── DashboardLayout.tsx     # Main dashboard layout with sidebar
│   ├── pages/
│   │   ├── LandingPage.tsx         # Public landing page
│   │   ├── LoginPage.tsx           # Login for students/admins
│   │   ├── SignupPage.tsx          # Registration for students/admins
│   │   ├── StudentDashboard.tsx    # Student dashboard
│   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   ├── QuizGeneratorPage.tsx   # AI quiz generation
│   │   ├── MessagingPage.tsx       # Chat/messaging system
│   │   ├── ProgressPage.tsx        # Progress predictor
│   │   ├── ResourcesPage.tsx       # Study resources
│   │   ├── ProfilePage.tsx         # User profile
│   │   └── NotFoundPage.tsx        # 404 error page
│   ├── routes.tsx                  # Route configuration
│   └── App.tsx                     # Root component
└── styles/
    ├── fonts.css                   # Font imports
    └── theme.css                   # Theme variables
```

## Routes

### Public Routes
- `/` - Landing page
- `/login/:role` - Login (student or admin)
- `/signup/:role` - Signup (student or admin)

### Protected Student Routes
- `/dashboard` - Student dashboard
- `/quiz-generator` - AI quiz generator
- `/progress` - Progress predictor
- `/messages` - Messaging system
- `/resources` - Study resources
- `/profile` - User profile

### Protected Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/students` - Student management
- `/admin/quizzes` - Quiz management
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings

## Key Features Explained

### Authentication Flow
1. User visits landing page
2. Clicks "Get Started" or "Sign In"
3. Selects role (student/admin)
4. Completes authentication
5. Redirected to appropriate dashboard
6. Session persists in localStorage
7. Can logout via sidebar button

### Messaging System
The messaging system provides a complete WhatsApp-style experience:

- **Chat List**: Searchable list of conversations with unread badges
- **Chat Window**: Full conversation view with message history
- **File Upload**: Click paperclip icon to attach files
- **Send Messages**: Type and press Enter or click send button
- **Mobile View**: Seamless transition between chat list and conversation
- **Status Indicators**: Online/offline status and read receipts

### Responsive Breakpoints
- Mobile: < 768px (bottom nav, hamburger menu)
- Tablet: 768px - 1024px (collapsible sidebar)
- Desktop: > 1024px (fixed sidebar)

## Customization

### Colors
Edit `src/styles/theme.css` to customize the color scheme:
- Primary colors (indigo/purple)
- Background and foreground colors
- Border and accent colors
- Dark mode variants

### Fonts
Add font imports to `src/styles/fonts.css`

### Routes
Modify `src/app/routes.tsx` to add or change routes

## Mock Data

The application currently uses mock data for:
- User authentication (in-memory)
- Quiz data
- Progress statistics
- Messages and chats

To connect to a real backend:
1. Replace mock authentication in `AuthContext.tsx`
2. Replace static data with API calls
3. Add API integration in respective page components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting via React Router
- Lazy loading of route components
- Optimized animations with Motion
- Responsive images and assets

## Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Backend API integration
- [ ] Actual AI quiz generation
- [ ] Video call integration
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Offline mode
- [ ] Multi-language support

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
