# Type Extract

An open, community-driven platform for extracting and classifying letter specimens from historical Indian printed books. Built with AdminJS, Express, Sequelize, and MySQL.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## About

**Type Extract** (branded as **Shaili Sanchaya** / **ಶೈಲಿ ಸಂಚಯ**) is a letter specimen extraction and tagging platform for historical Indian printed books. A *śaili* (ಶೈಲಿ) is the characteristic shape a letter takes in a particular typeface — the trace left behind by a foundry, a press, and an era.

Working from digitized books — many printed in the 19th century by the mission presses of Mangaluru and Bengaluru — volunteers select individual letter specimens straight from scanned pages, tag them by letter type, and assemble a reference collection that no single foundry catalogue can offer.

### Key Features

- **Book Archive** — Manages digitized books from the [Internet Archive](https://archive.org), supporting 23+ Indian languages
- **Letter Extraction** — Crop individual letter specimens (vowels, consonants, conjuncts, numerals, symbols) directly from scanned book pages
- **Tagging Workflow** — Classify specimens by letter type with progress tracking per book
- **Side-by-Side Comparison** — Compare tagged letters across books with language filtering
- **PDF Export** — Generate PDF reports of all tagged specimens organized by language and letter type
- **ZIP Download** — Download tagged letter images as ZIP archives
- **User Profiles** — Developer portal-style profile management with avatar upload
- **Role-Based Access** — Admin, Reviewer, User, QA, and Developer roles
- **Collaborative Comments** — Add and edit comments on books
- **Internet Archive Integration** — Fetch books by language from the IA Advanced Search API with background job queue

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js 4.x |
| Admin Panel | AdminJS 7.x |
| Language | TypeScript 5.x |
| Database | MySQL |
| ORM | Sequelize 6.x |
| Frontend | React 18, React Router 6, styled-components 6 |
| Design System | @adminjs/design-system |
| Template Engine | Edge.js 6.x |
| Password Hashing | Argon2 |
| Session | express-session + express-mysql-session |
| Email | Nodemailer (Gmail SMTP) |
| PDF Generation | Puppeteer (headless Chrome) |
| Authentication | AdminJS built-in auth + Google OAuth 2.0 |

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 5.7
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ravenanhq/type-extract.git
cd type-extract

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials, Gmail SMTP, and Google OAuth keys

# Run database migrations
npm run migrate:up

# Seed initial data (roles, languages, letter types, sample letters)
npm run seed:up

# Start development server
npm run dev
```

The admin panel will be available at `http://localhost:8000/admin`.

### Build & Production

```bash
# Build TypeScript and copy assets
npm run build

# Start production server
npm start
```

### Database Setup

The application uses Sequelize migrations. Key commands:

```bash
npm run migrate:up     # Run all pending migrations
npm run migrate:undo   # Undo the last migration
npm run seed:up        # Seed initial data
```

### Environment Variables

| Variable | Description |
|---|---|
| `MYSQL_HOST` | MySQL host |
| `MYSQL_DATABASE` | Database name |
| `MYSQL_USER` | Database user |
| `MYSQL_PASS` | Database password |
| `MYSQL_PORT` | Database port (default: 3306) |
| `BASE_URL` | Application base URL (e.g., `http://localhost:8000`) |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PASSWORD_RESET_EXPIRATION_TIME` | Password reset token expiry (minutes) |
| `EMAIL_VERIFICATION_TIME` | Email verification token expiry (days) |

## Project Structure

```
src/
├── index.ts                      # Express app entry point
├── common/
│   ├── EdgeConfig.ts             # Edge.js template engine
│   ├── MailerService.ts          # Nodemailer transport
│   └── menu.ts                   # AdminJS sidebar menu
├── backend/
│   ├── controllers/              # Express route handlers
│   ├── db/
│   │   ├── config/               # Sequelize configuration
│   │   ├── migrations/           # Database migrations
│   │   ├── models/               # Sequelize models
│   │   └── seeders/              # Seed data
│   ├── resources/                # AdminJS resource definitions
│   ├── routers/
│   │   ├── AdminRouters.ts       # Authenticated API routes
│   │   └── NonAdminRouters.ts    # Public routes (signup, login)
│   ├── services/                 # Business logic services
│   ├── templates/                # Edge.js email/PDF templates
│   └── utils/                    # Utility functions
├── frontend/
│   ├── components.ts             # AdminJS component registrations
│   ├── components/               # React components (28 modules)
│   ├── context/                  # React context providers
│   └── views/                    # Edge.js server-rendered views
└── public/                       # Static assets (CSS, JS, images)
```

## Database Models

| Model | Description |
|---|---|
| **Users** | User accounts with profiles, roles, and preferences |
| **UserRoles** | Role definitions (Admin, Reviewer, User, QA, Developer) |
| **Languages** | 23+ Indian languages with Unicode/IPA metadata |
| **LetterTypes** | Letter categories (Vowels, Consonants, Conjuncts, etc.) |
| **Letters** | Individual letter specimens with Unicode codepoints |
| **Books** | Digitized books with metadata from Internet Archive |
| **BookStatus** | Book processing status (New, In Progress, Needs Review, Completed) |
| **TaggedLetters** | Extracted letter specimens linked to books and letters |
| **Comments** | Collaborative comments on books |
| **PasswordResetTokens** | Password reset tokens |

### Relationships

```
Users ──belongsTo──> UserRoles
Languages ──hasMany──> LetterTypes
Languages ──hasMany──> Books
Letters ──belongsTo──> LetterTypes
Letters ──belongsTo──> Languages
TaggedLetters ──belongsTo──> Letters
TaggedLetters ──belongsTo──> Books
Books ──belongsTo──> BookStatus
Comments ──belongsTo──> Books
Comments ──belongsTo──> Users
```

## API Endpoints

### Public Routes

| Method | Path | Description |
|---|---|---|
| GET | `/` | Landing page |
| GET | `/admin/signup` | Registration form |
| POST | `/admin/signup` | Create account |
| GET | `/admin/forgot-password` | Password reset request |
| POST | `/admin/reset-password` | Execute password reset |
| POST | `/admin/signin-with-gmail` | Google OAuth sign-in |

### Book Management

| Method | Path | Description |
|---|---|---|
| GET | `/admin/get-books` | List all books |
| GET | `/admin/get-books-with-tags` | List books with tagged letters |
| GET | `/admin/search-books` | Search books by name |
| GET | `/admin/books-by-language` | Get books for a language |
| GET | `/admin/total-pages` | Get total pages for a book |
| GET | `/admin/fetch-page` | Fetch a book page image |
| POST | `/admin/prefetch-pages` | Batch-prefetch book pages |
| GET | `/admin/book-info` | Get book metadata |

### Letter Tagging

| Method | Path | Description |
|---|---|---|
| GET | `/admin/get-letters` | List all active letters |
| GET | `/admin/get-lettertypes` | List all active letter types |
| GET | `/admin/get-languages` | List all languages |
| GET | `/admin/tagged-letter` | Get tagged letters for a book |
| POST | `/admin/save-tag` | Save a new letter tag |
| DELETE | `/admin/delete-tag` | Delete a tagged letter |
| POST | `/admin/update-tag` | Update a tag's letter assignment |
| GET | `/admin/get-tagged-percentage` | Get tagging progress |

### Export

| Method | Path | Description |
|---|---|---|
| GET | `/admin/pdf-generator` | Generate PDF report |
| GET | `/admin/download-tags-zip` | Download tags as ZIP |

### Profile & Comments

| Method | Path | Description |
|---|---|---|
| GET | `/admin/profile` | Get user profile |
| PUT | `/admin/profile` | Update profile |
| POST | `/admin/profile/avatar` | Upload avatar |
| GET | `/admin/get-comments` | Get book comments |
| POST | `/admin/add-comment` | Add a comment |
| POST | `/admin/edit-comment` | Edit a comment |

## Role-Based Access Control

| Role | Permissions |
|---|---|
| **Admin** (1) | Full access to all resources, user management, book deletion, IA fetching |
| **Reviewer** (2) | Edit books, view resources, limited admin access |
| **User** (3) | Basic access, tag letters, add comments |
| **QA** (4) | Basic access, tag letters, add comments |
| **Developer** (5) | Basic access, tag letters, add comments |

## Supported Languages

Type Extract supports 23+ Indian languages with pre-seeded letter types and Unicode metadata:

Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, Sanskrit, Santali, Kashmiri, Nepali, Sindhi, Konkani, Dogri, Manipuri, Bodo, English

## Workflow

1. **Ingest** — Admins fetch books from Internet Archive by language via job queue
2. **Browse** — Users select a book and page through scanned images
3. **Extract** — Use the cropper tool to select individual letter specimens
4. **Tag** — Classify the specimen by letter type (vowel, consonant, conjunct, etc.)
5. **Track** — Progress bar shows tagging completion per book
6. **Compare** — Side-by-side comparison of tagged letters across books
7. **Export** — Generate PDF reports or download tagged images as ZIP

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **GNU Affero General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

Under the AGPL, you may:
- **Use** — Use the software for any purpose
- **Study** — Study how the software works and modify it
- **Share** — Share copies of the software
- **Modify** — Modify the software and distribute modified versions

If you run the software on a server providing network access (e.g., as a web application), you must also make the source code available to users interacting with that server. See the [full license text](https://www.gnu.org/licenses/agpl-3.0.html) for complete terms.
