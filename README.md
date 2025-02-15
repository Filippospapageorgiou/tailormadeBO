Below is a revised version of your README file with clearer instructions and proper formatting:

---

# TailorMadeBo - Private Barista Beverage

This project is built with **SvelteKit 5** and **Supabase**. Follow the instructions below to set up and run the project.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- A [Supabase](https://supabase.com/) account.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Configure Supabase

Before running the project, you need to set up your Supabase environment variables. Create a `.env` file in the root directory and add the following:

```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

> **Note:** Replace `<your-supabase-url>` and `<your-supabase-anon-key>` with your actual Supabase credentials.

### 3. Install Dependencies

First, install the Supabase-related dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
```
```bash
npm i lucide-svelte
```

Then, install the remaining dependencies:

```bash
npm install
```

### 4. Build the Project

```bash
npm run build
```

### 5. Run the Development Server

```bash
npm run dev
```

Now, open your browser and navigate to [http://localhost:5173](http://localhost:5173) to see your application in action.
