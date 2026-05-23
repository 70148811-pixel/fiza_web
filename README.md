# 🌌 NexusHub | Role-Based Secure React & Firebase Workspace

NexusHub is a state-of-the-art, secure, role-based task management and dynamic real-time messaging application. Engineered using **React**, **Cloud Firestore**, **Firebase Authentication**, and **Vite**, it demonstrates premium light-mode visual design, bulletproof route guards, and real-time collaboration widgets.

---

## 🚀 Key Feature Highlights

### 🔒 1. Advanced Authentication Flow (`Task 1`)
- **Email & Password Portal:** Full registration and sign-in pipelines with credential length validation and error banners.
- **Google Cloud Sign-In:** One-click single sign-on leveraging Google Auth Provider.
- **Account Recovery:** Self-service password recovery email dispatcher.
- **Deactivation Protocol:** Red-coded account deactivation that purges the user's profile and created documents from Firestore.

### 🗄️ 2. Dynamic User Database Sync (`Task 2`)
- **No-Duplicate Registration:** Instantly syncs new users to the Firestore `users` collection.
- **Role Assignments:** Saves creation timestamps, emails, display names, profile avatars, and roles (`admin` or `user`).

### 🛡️ 3. Role-Based Protected Routing (`Task 3`)
- **Interactive Checkpoints:** Route guards block unauthenticated entry.
- **Privilege Filtration:** Restricts `/admin` panels to users with `role = "admin"`.
- **Intelligent Routing:** Non-admins attempting admin access are redirected to a custom **Access Denied (Unauthorized)** page with an automatic countdown and safe dashboard routing.

### 📝 4. Secured Task CRUD System (`Task 4`)
- **Normal Users:** Have sandbox isolation. They can create, edit, delete, and view **only their own** documents.
- **System Admins:** Have global authority. They can view, create (and assign to other system users), update, and delete **all task documents** across the platform.
- **Inspections (Dynamic Route):** Accessing `/tasks/:id` triggers dynamic document queries and enforces access rights before loading.

### 💬 5. Dynamic Real-Time Chat Engine (`Task 5`)
- **Direct Messaging:** Authenticated members can chat with any registered user in the organization.
- **Instant Synchronization:** Connects to Firestore subcollections using `onSnapshot` real-time listeners for zero-refresh chat bubble updates.
- **Premium Interface:** Split-pane panel featuring active contacts search, avatar indicators, sent/received bubble alignment, and auto-scroll viewport anchors.

### 📊 6. Interactive Visual Analytics (`Task 6`)
- **Performance Indices:** Displays count widgets, pending jobs, completed items, and a pure CSS circular completion-efficiency graph.
- **Administrative Directory:** Direct view of system-wide users with live selectors allowing administrators to promote/demote members in real-time.

---

## ⚡ Setup & Local Installation

Follow these steps to deploy and run NexusHub on your local machine:

### 📦 1. Clone & Install Dependencies
```bash
# Navigate to project folder
cd Fiza_web_4

# Install NPM packages
npm install
```

### 🔑 2. Configure Firebase Environment Settings
Create a `.env` (or `.env.local`) file in the root folder. You can copy the contents from `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_actual_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_actual_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_actual_app_id_here
```

### ✨ Dual Operation Modes: Local Demo vs. Live Firebase
NexusHub features a smart **Dual-Mode Engine**. If you don't have Firebase keys ready, the application **runs 100% perfectly in Demo Mode** out of the box!
- **Demo Mode (Default):** Runs when `.env` is empty or has mock values. Persists all users, tasks, and chat messages in `localStorage`. Includes pre-seeded accounts:
  - 👤 **Admin Profile:** `admin@nexushub.com` / Password: `admin123`
  - 👤 **Normal User:** `user@nexushub.com` / Password: `user123`
- **Live Firebase Mode:** Activates automatically once valid keys are placed in your `.env` file. Integrates real Firebase Authentication, Firestore databases, and live messaging.

### 🚀 3. Run Locally
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 📂 Project Structure Tree

```
Fiza_web_4/
├── public/
├── src/
│   ├── assets/              # Premium vector SVG logo and styling assets
│   │   └── logo.svg
│   ├── components/          # Shared Layout Components
│   │   ├── Sidebar.jsx      # Navigation sidebar, delete confirmation flows
│   │   └── Header.jsx       # Global page headers, Demo-mode warnings, active user profile
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Toggles credentials between Firebase Auth & sessionStorage mocks
│   ├── firebase/            # Database Connection
│   │   ├── config.js        # Initializes Firebase SDK / flags Demo Mode status
│   │   └── services.js      # Global CRUD, live chat listeners, and user updates routing
│   ├── pages/               # Functional Pages
│   │   ├── SignIn.jsx       # Login card with Google SSO and error banners
│   │   ├── SignUp.jsx       # Account registration with card-based role selection
│   │   ├── ForgotPassword.jsx # Recovery mail request panel
│   │   ├── UserDashboard.jsx # Personal task manager & circular metrics
│   │   ├── AdminDashboard.jsx # Global tasks manager, system stats, user promotions directory
│   │   ├── TaskDetail.jsx   # Dynamic page (/tasks/:id) inspecting secure files
│   │   ├── ChatPage.jsx     # DM contacts search panel & real-time chat bubbles
│   │   └── Unauthorized.jsx # Sleek "Access Denied" page with auto-redirect countdowns
│   ├── routes/              # Routing Layer
│   │   ├── AppRoutes.jsx    # React Router DOM mapping
│   │   └── ProtectedRoute.jsx # Authentication filters and role guards
│   ├── App.jsx              # Main App entry wrapping global contexts
│   ├── index.css            # Custom premium Vanilla CSS design system variables & animations
│   └── main.jsx             # React DOM renderer
├── .env.example             # Template file outlining required keys
├── package.json
└── vite.config.js
```

---

## 🛠️ Deploy to Production (Firebase Hosting / Vercel)

### Option A: Deploying on Vercel (Recommended for simplicity)
1. Install Vercel CLI: `npm install -g vercel`
2. Run command `vercel` from the root folder.
3. Configure settings, add environment variables in the Vercel dashboard, and deploy.

### Option B: Deploying on Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize project: `firebase init` (Select Hosting and Firestore).
3. Set build directory to `dist`.
4. Compile production assets: `npm run build`
5. Deploy: `firebase deploy`
