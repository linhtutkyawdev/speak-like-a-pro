# Speak Like a Pro

## Project Description

"Speak Like a Pro" is a comprehensive web application designed to empower users in enhancing their speaking proficiency through interactive practice sessions and structured educational courses. The platform is built with a robust backend powered by Convex for real-time data management and leverages Clerk for secure and efficient user authentication, ensuring a smooth and engaging learning journey.

## Features

- **Interactive Speaking Practice:** Engage in dynamic exercises to improve pronunciation, fluency, and confidence.
- **Structured Courses:** Access a variety of courses tailored to different skill levels and learning objectives.
- **User Authentication:** Secure login and registration powered by Clerk.
- **Course Management:** (Admin) Create, update, and manage courses and lessons.
- **User Management:** (Admin) Oversee user accounts and roles.
- **Real-time Data:** Seamless data synchronization and updates with Convex backend.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend/Database:** Convex
- **Authentication:** Clerk
- **Deployment:** Vercel

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or Bun

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/speak-like-a-pro.git
   cd speak-like-a-pro
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up Convex:**

   - Install the Convex CLI:
     ```bash
     bunx convex init
     ```
   - Log in to Convex:
     ```bash
     bunx convex auth
     ```
   - Deploy your Convex backend:
     ```bash
     bunx convex deploy
     ```

4. **Set up Clerk:**

   - Create a Clerk account and application at [Clerk](https://clerk.com/).
   - Obtain your Clerk Public Key and Secret Key.

5. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:

   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CONVEX_DEPLOYMENT_URL=your_convex_deployment_url # This is usually set automatically by `bunx convex deploy`
   ```

## Usage

### Running the Development Server

```bash
bun run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port indicated in your terminal).

### Running Tests

(If applicable, add instructions for running tests here)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'feat: Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## License

This project is licensed under the MIT License.
