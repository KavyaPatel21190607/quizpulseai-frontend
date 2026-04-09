Design a full-scale, production-ready, modern web application UI/UX for an AI-powered learning platform named “QuizPulseAI”.

This is NOT a simple UI. Generate a COMPLETE DESIGN SYSTEM + HIGH-FIDELITY SCREENS + COMPONENT LIBRARY.

The platform has two roles:
1) Student (Primary user)
2) Admin (System controller)

Follow a clean SaaS product style similar to Notion, Stripe, or Linear with strong UX clarity.

--------------------------------------------------

🎨 1. DESIGN LANGUAGE & VISUAL SYSTEM

- Style: Minimal, modern SaaS UI with subtle glassmorphism
- Border radius: 12px–16px
- Shadows: Soft layered shadows (not harsh)
- Grid system: 8px spacing system
- Layout: 12-column responsive grid
- Animations: Smooth transitions (200–300ms ease-in-out)
- Depth: Use elevation hierarchy (cards > background)

COLOR SYSTEM:
- Primary: Indigo (#4F46E5)
- Secondary: Purple (#7C3AED)
- Accent: Cyan or Teal (#06B6D4)
- Background Light: #F9FAFB / #FFFFFF
- Background Dark: #0F172A
- Text Primary: #111827
- Text Secondary: #6B7280
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

TYPOGRAPHY:
- Font: Inter or Poppins
- Headings: Bold, clear hierarchy
- Body: Clean and readable (16px base)
- Use consistent scale (H1–H6, captions)

ICONS:
- Use Lucide / Feather icons
- Keep consistent stroke width

--------------------------------------------------

🧱 2. DESIGN SYSTEM (MANDATORY)

Create reusable components:

- Buttons:
  - Primary (filled)
  - Secondary (outline)
  - Ghost
  - Disabled states
  - Loading state

- Inputs:
  - Text field
  - Dropdown
  - Multi-select
  - Search bar
  - Error/valid states

- Cards:
  - Standard card
  - Stat card
  - Interactive card (hover effect)

- Navigation:
  - Sidebar (collapsed + expanded)
  - Top navbar

- Modals & Drawers:
  - Confirmation modal
  - Form modal

- Tabs & Pills
- Badges (status indicators)
- Tooltips
- Notifications (toast system)

- Charts:
  - Line chart (progress)
  - Bar chart (performance)
  - Pie chart (distribution)

--------------------------------------------------

📐 3. GLOBAL LAYOUT STRUCTURE

APP STRUCTURE:
- Left sidebar navigation (fixed)
- Top navbar (search, notifications, profile)
- Main content area (scrollable)

SIDEBAR:
- Logo at top (QuizPulseAI)
- Menu:
  - Dashboard
  - Quiz Generator
  - Messages
  - AI Progress
  - Profile
- Admin panel (visible only for admin)

TOP NAVBAR:
- Global search bar
- Notification bell
- User avatar dropdown

--------------------------------------------------

👨‍🎓 4. STUDENT EXPERIENCE (DETAILED SCREENS)

🔹 DASHBOARD:
- Welcome header ("Welcome back, [Name]")
- Stats cards:
  - Total quizzes taken
  - Average score
  - AI skill level (tag: Beginner/Intermediate/Advanced)
  - Streak (days active)
- Charts:
  - Weekly progress (line chart)
- Sections:
  - Recent quizzes (card list with score + date)
  - AI Recommended quizzes (horizontal scroll cards)
- CTA: “Generate New Quiz”

🔹 QUIZ GENERATOR:
- Form layout:
  - Topic input (AI-assisted autocomplete)
  - Subject dropdown
  - Difficulty slider (Easy → Hard)
  - Question types (checkbox):
    - MCQ
    - True/False
    - Short answer
  - Number of questions selector
- Generate button (prominent)

- Quiz UI:
  - Question card
  - Options (radio buttons)
  - Timer at top
  - Progress bar
  - Next/Previous buttons
- Submission screen:
  - Score summary
  - Correct/incorrect breakdown
  - AI explanation per question
  - Retry button

🔹 MESSAGING MODULE:
- Split layout:
  LEFT:
    - Chat list (avatars + last message preview)
    - Search users
  RIGHT:
    - Chat window
- Chat features:
  - Message bubbles (sent/received)
  - Typing indicator
  - Seen status
  - Attachments
- Profile preview panel (optional)
- Follow/unfollow system

🔹 AI PROGRESS PREDICTOR:
- Dashboard:
  - Circular skill meter
  - Graph of performance trend
- AI Insights:
  - Strengths (tags)
  - Weaknesses (tags)
- Prediction card:
  - “You will reach Advanced level in X days”
- Personalized recommendations

🔹 PROFILE PAGE:
- Avatar + user info
- Editable fields
- Stats summary
- Activity timeline

--------------------------------------------------

🛠️ 5. ADMIN EXPERIENCE (ADVANCED)

🔹 ADMIN DASHBOARD:
- Stats:
  - Total users
  - Active users
  - Total quizzes
  - Flagged reports
- Graphs:
  - User growth
  - Platform engagement

🔹 STUDENT MANAGEMENT:
- Table:
  - Name, email, status, performance
- Features:
  - Search + filters
  - View profile
  - Ban/suspend
  - Edit user

🔹 MESSAGE MODERATION:
- View all chats
- Highlight flagged messages
- Actions:
  - Warn
  - Ban
- Chat preview panel

🔹 ADMIN PROFILE:
- Admin info + activity logs

--------------------------------------------------

🌙 6. DARK MODE

- Fully designed dark mode
- Maintain contrast and readability
- Same components adapted

--------------------------------------------------

📱 7. RESPONSIVENESS

- Desktop (primary)
- Tablet layout
- Mobile layout:
  - Collapsible sidebar
  - Bottom navigation (optional)

--------------------------------------------------

✨ 8. MICRO INTERACTIONS

- Hover effects on cards
- Button press animation
- Smooth transitions
- Loading skeletons
- Empty states with illustrations

--------------------------------------------------

🧠 9. UX PRINCIPLES

- Fast and intuitive navigation
- Clear hierarchy
- Reduce cognitive load
- AI-first experience
- Student-focused engagement

--------------------------------------------------

📦 FINAL OUTPUT REQUIREMENTS:

- Full design system page
- All screens in high fidelity
- Component library
- Light + dark mode
- Responsive layouts
- Interactive prototype (if possible)

IMPORTANT:
- Maintain consistency across all screens
- Use reusable components everywhere
- Ensure pixel-perfect spacing and alignment