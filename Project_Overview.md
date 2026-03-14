# Local Services Web Platform: Project Overview

This project is a **Local Services Web Platform** (similar to TaskRabbit or Urban Company) designed to connect everyday users with local service providers like plumbers, electricians, and cleaners.

It is built on a standard **MERN-like stack** (using vanilla HTML/JS instead of React for the frontend, alongside Node.js, Express, and MongoDB).

Here is a comprehensive breakdown of the project architecture, modules, and files:

## 🖥️ Frontend (Client-Side)
The frontend is built with vanilla HTML, CSS, and JavaScript, focusing on a responsive, dark-themed UI.

* **`index.html`**: The main user-facing application. It acts as a single-page application (SPA) containing the landing page, dynamic service categories, authentication forms (Registration/Login), and dedicated dashboards for both regular Users and Workers. Modals are used heavily here for booking workers and viewing applicant lists.
* **`admin.html`**: A separate, secure portal strictly for administrators to oversee the platform, view metrics, and manage/delete records.
* **`styles.css`**: The global stylesheet. It defines the dark-mode aesthetics, custom CSS variables, flex/grid layouts for the service cards, form styling, and interactive component states (like hover effects and modal popups).
* **`script.js`**: The powerhouse of the frontend. It handles all dynamic behavior for `index.html`: toggling UI states between logged-out/user/worker views, capturing form submissions, making asynchronous `fetch` calls to the backend API, rendering dashboard data, and managing local storage for authentication tokens.
* **`admin.js`**: The JavaScript logic exclusive to `admin.html`. It handles admin authentication, fetching system-wide data, and executing cascade deletions.

---

## ⚙️ Backend Core (Server-Side)
Building the API that serves the frontend and interacts with the database.

* **`server.js`**: The entry point of the Node.js application. It sets up the Express server, applies central middleware (like CORS for cross-origin requests and JSON body parsing), establishes the connection to MongoDB, and roots all the API endpoints (e.g., routing anything starting with `/api/auth` to the `authRoutes`).
* **`package.json`**: Tracks all the project's Node dependencies (like `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`) and defines startup scripts (like `npm run dev` using Nodemon for hot-reloading).
* **`.env`**: Stores sensitive environment variables such as the server `PORT` (5002), the `MONGO_URI` for database connection, and the `JWT_SECRET` for securing sessions.

---

## 🗄️ Database Models (`/models/`)
These files define the structure (Schemas) of the data stored in MongoDB using Mongoose.

* **`User.js`**: A unified schema for all accounts. It differentiates privileges via a `role` field (`user`, `worker`, `admin`). It stores authentication details, hashed passwords, and worker-specific metadata like `skills`, `availability`, and `serviceType`.
* **`Job.js`**: Represents "Part-Time Jobs" posted by regular users. It tracks the job description, location, pay, and an array of `applications` containing the IDs of workers who have requested to do the job.
* **`Booking.js`**: Represents a "Direct Booking" when a user bypasses the job board and directly requests a specific worker from the categorized list. Stores contact details and the specific service needed.
* **`QuickRequest.js` & `Contact.js`**: Simple schemas for handling unauthenticated form submissions from the landing page. `QuickRequest` is for fast service pings, and `Contact` is for general platform support inquiries.

---

## 🧠 Controllers (`/controllers/`)
Controllers contain the actual business logic and database operations for each specific feature.

* **`authController.js`**: Manages registration and login. It handles formatting data (like lowercasing emails to prevent login bugs), encrypting passwords using `bcryptjs`, and verifying credentials to issue JSON Web Tokens (JWT).
* **`jobController.js`**: Handles the lifecycle of part-time jobs. Functions include creating a job, fetching job feeds with filters, allowing workers to apply (`applyForJob`), and allowing users/admins to accept an applicant (`selectWorker`).
* **`workerController.js`**: Manages worker-specific actions. This includes endpoints for users to fetch lists of workers by category, updating worker profiles, handling direct booking submissions, and compiling the robust data needed for the Worker Dashboard.
* **`userController.js`**: Primarily serves the User Dashboard by gathering all jobs posted by the specific user (and populating them with the details of workers who applied) alongside their direct booking history.
* **`adminController.js`**: Contains high-level operations for the admin portal. It fetches platform-wide statistics and handles secure **cascade deletions** (e.g., if a user is deleted, this controller ensures all their associated jobs, bookings, and applications are cleanly erased from the database).

---

## 🛣️ Routes (`/routes/`)
Routes act as the traffic cops of the backend, mapping specific URL endpoints to the functions inside the Controllers.

* **`authRoutes.js`**: Endpoints like `POST /login` and `POST /register`.
* **`jobRoutes.js`**: Endpoints for creating and managing job postings.
* **`workerRoutes.js`**: Endpoints for fetching public worker directories and submitting direct bookings.
* **`userRoutes.js`**: Endpoints specific to fetching a user's private dashboard.
* **`adminRoutes.js`**: Secure endpoints for admin oversight.

---

## 🔐 Security & Middleware (`/verifyToken/`)
* **`auth.js`**: This crucial module handles security. It contains:
  1. `generateToken()`: Creates the secure JWT payload upon successful login.
  2. `auth` middleware: Intercepts incoming requests to private routes, extracts the token from the headers, verifies it, and identifies *who* is making the request.
  3. `requireRole()` middleware: Adds an extra layer of Role-Based Access Control (RBAC), ensuring that standard users cannot suddenly access endpoints meant only for `admin` or `worker` roles.
