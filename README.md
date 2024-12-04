# Shaili

## Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies using pnpm**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   - Copy the `.env.dist` file to create a `.env` file:
     ```bash
     cp .env.dist .env
     ```
   - Edit the `.env` file with your project-specific values.

4. **Run database migrations**:
   ```bash
   pnpm migrate:up
   ```

5. **Seed the database**:
   ```bash
   pnpm seed:up
   ```

---

## Running the Project

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Access the AdminJS panel**:
   - Visit `http://localhost:3000` (or the port you defined in the `.env` file).

---
