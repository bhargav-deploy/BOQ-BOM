# BOQ Automator

This is a [Next.js](https://nextjs.org) project.

## Getting Started (For new setup)

Follow these steps to set up the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended: Latest LTS version)
- npm (comes with Node.js)

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Setup:**

    - Duplicate the `.env.example` file and rename it to `.env`.
    - Update the `NEXTAUTH_SECRET` in `.env` with a random string.

    ```bash
    # Windows
    copy .env.example .env
    ```

3.  **Database Setup:**

    Initialize the database using Prisma.

    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
