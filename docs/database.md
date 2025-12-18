# Veriling Database Plan

B2B2C Japanese Language Assessment Platform for Universities

---

## Overview

Veriling is a web-based testing platform for Japanese language proficiency, targeting university students preparing to work in Japan.

### Key Decisions

| Area           | Decision                                            |
| -------------- | --------------------------------------------------- |
| Auth           | better-auth with `organization` + `admin` plugins   |
| Organizations  | Universities = organizations                        |
| Platform roles | `admin`, `user` (via admin plugin)                  |
| Org roles      | `owner`, `admin`, `member` (via org plugin)         |
| Content        | Veriling-provided (global) + Org-provided           |
| Question type  | Multiple choice (4 options), Markdown, images/audio |
| Scoring        | 1 point per question                                |
| Time limit     | Per test, configurable                              |
| Results        | Final score + per-question breakdown                |
| Attempts       | Store all attempts                                  |
| Multi-tenancy  | Shared DB now → isolated D1 per org later           |

---

## Schema

### Tables Managed by better-auth

These tables are created and managed by better-auth and its plugins. Do not modify directly.

#### Core (better-auth)

| Table          | Purpose                                  |
| -------------- | ---------------------------------------- |
| `user`         | User accounts (extended by admin plugin) |
| `session`      | Active sessions (extended by org plugin) |
| `account`      | OAuth/credential accounts                |
| `verification` | Email verification tokens                |

#### Admin Plugin Additions

Adds to `user` table:

- `role` — Platform role (`admin`, `user`)
- `banned` — Boolean
- `banReason` — String (optional)
- `banExpires` — Date (optional)

Adds to `session` table:

- `impersonatedBy` — Admin user ID if impersonating

#### Organization Plugin Additions

| Table          | Purpose                          |
| -------------- | -------------------------------- |
| `organization` | Universities/institutions        |
| `member`       | User membership in organizations |
| `invitation`   | Pending org invitations          |

Adds to `session` table:

- `activeOrganizationId` — Currently selected org

---

### App-Specific Tables

#### `question`

Question bank. Questions can be global (Veriling-provided) or org-specific.

| Column           | Type     | Required | Description                                  |
| ---------------- | -------- | -------- | -------------------------------------------- |
| `id`             | string   | ✓        | Primary key                                  |
| `organizationId` | string   |          | FK → organization. NULL = Veriling global    |
| `createdById`    | string   | ✓        | FK → user                                    |
| `content`        | text     | ✓        | Question text (Markdown)                     |
| `optionA`        | text     | ✓        | First option (Markdown)                      |
| `optionB`        | text     | ✓        | Second option (Markdown)                     |
| `optionC`        | text     | ✓        | Third option (Markdown)                      |
| `optionD`        | text     | ✓        | Fourth option (Markdown)                     |
| `correctOption`  | string   | ✓        | Correct answer: `A`, `B`, `C`, or `D`        |
| `imageUrl`       | string   |          | Optional image URL                           |
| `audioUrl`       | string   |          | Optional audio URL                           |
| `explanation`    | text     |          | Explanation shown after answering (Markdown) |
| `createdAt`      | datetime | ✓        |                                              |
| `updatedAt`      | datetime | ✓        |                                              |

**Indexes:**

- `organizationId` — Filter by org
- `createdById` — Filter by creator

---

#### `test`

Test definitions. Tests can be global (Veriling tryouts) or org-specific.

| Column             | Type     | Required | Description                               |
| ------------------ | -------- | -------- | ----------------------------------------- |
| `id`               | string   | ✓        | Primary key                               |
| `organizationId`   | string   |          | FK → organization. NULL = Veriling global |
| `createdById`      | string   | ✓        | FK → user                                 |
| `title`            | string   | ✓        | Test name                                 |
| `description`      | text     |          | Test description (Markdown)               |
| `timeLimitSeconds` | integer  |          | Time limit in seconds. NULL = no limit    |
| `isPublished`      | boolean  | ✓        | Whether test is visible/takeable          |
| `createdAt`        | datetime | ✓        |                                           |
| `updatedAt`        | datetime | ✓        |                                           |

**Indexes:**

- `organizationId` — Filter by org
- `isPublished` — Filter published tests

---

#### `test_question`

Junction table linking tests to questions with ordering.

| Column       | Type    | Required | Description             |
| ------------ | ------- | -------- | ----------------------- |
| `id`         | string  | ✓        | Primary key             |
| `testId`     | string  | ✓        | FK → test               |
| `questionId` | string  | ✓        | FK → question           |
| `order`      | integer | ✓        | Display order (1-based) |

**Indexes:**

- `testId` — Get all questions for a test
- `testId, order` — Ordered retrieval
- `questionId` — Find which tests use a question

**Constraints:**

- Unique: `(testId, questionId)` — No duplicate questions in a test
- Unique: `(testId, order)` — No duplicate order positions

---

#### `attempt`

Each test submission by a user.

| Column             | Type     | Required | Description                             |
| ------------------ | -------- | -------- | --------------------------------------- |
| `id`               | string   | ✓        | Primary key                             |
| `testId`           | string   | ✓        | FK → test                               |
| `userId`           | string   | ✓        | FK → user                               |
| `score`            | integer  | ✓        | Number of correct answers               |
| `totalQuestions`   | integer  | ✓        | Total questions in test                 |
| `startedAt`        | datetime | ✓        | When user started                       |
| `completedAt`      | datetime |          | When user submitted. NULL = in progress |
| `timeSpentSeconds` | integer  |          | Total time spent                        |
| `createdAt`        | datetime | ✓        |                                         |

**Indexes:**

- `userId` — User's attempt history
- `testId` — All attempts for a test
- `userId, testId` — User's attempts for specific test

---

#### `attempt_answer`

Per-question responses for analytics and review.

| Column           | Type     | Required | Description                                          |
| ---------------- | -------- | -------- | ---------------------------------------------------- |
| `id`             | string   | ✓        | Primary key                                          |
| `attemptId`      | string   | ✓        | FK → attempt                                         |
| `questionId`     | string   | ✓        | FK → question                                        |
| `selectedOption` | string   |          | User's answer: `A`, `B`, `C`, `D`, or NULL (skipped) |
| `isCorrect`      | boolean  | ✓        | Whether answer was correct                           |
| `createdAt`      | datetime | ✓        |                                                      |

**Indexes:**

- `attemptId` — Get all answers for an attempt
- `questionId` — Analytics: how users answered this question

**Constraints:**

- Unique: `(attemptId, questionId)` — One answer per question per attempt

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BETTER-AUTH MANAGED                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐             │
│  │   user   │────<│  member  │>────│ organization │             │
│  └──────────┘     └──────────┘     └──────────────┘             │
│       │                                   │                     │
│       │           ┌──────────┐            │                     │
│       └──────────<│ session  │            │                     │
│                   └──────────┘            │                     │
│                                           │                     │
└───────────────────────────────────────────│─────────────────────┘
                                            │
┌───────────────────────────────────────────│─────────────────────┐
│                     APP-SPECIFIC          │                     │
├───────────────────────────────────────────│─────────────────────┤
│                                           │                     │
│  ┌──────────┐                    ┌────────┴───┐                 │
│  │   test   │───────────────────>│  question  │                 │
│  └──────────┘   test_question    └────────────┘                 │
│       │                                 │                       │
│       │                                 │                       │
│       v                                 v                       │
│  ┌──────────┐                  ┌────────────────┐               │
│  │ attempt  │─────────────────>│ attempt_answer │               │
│  └──────────┘                  └────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend:
  ────>  One-to-many
  ───<>  Many-to-many (via junction)
```

---

## Access Patterns

### MVP (Demo/Tryouts)

| Action                  | Who Can Do It                    |
| ----------------------- | -------------------------------- |
| View global tests       | Any authenticated user           |
| Take global tests       | Any authenticated user           |
| View org tests          | Any authenticated user (for now) |
| Take org tests          | Any authenticated user (for now) |
| Create global tests     | Platform admins only             |
| Create global questions | Platform admins only             |
| Create org tests        | Org owners/admins                |
| Create org questions    | Org owners/admins                |

### Future (Post-MVP)

- Org tests visible only to org members
- Test assignments to specific users/classes
- Class/cohort management

---

## Multi-Tenancy Strategy

### Current (MVP)

- Single shared D1 database
- `organizationId` column distinguishes org-specific content
- `organizationId = NULL` indicates Veriling-provided content

### Future (Scale)

- Separate D1 instance per organization
- Migration path:
  1. Export org-specific data (questions, tests, attempts where `organizationId = X`)
  2. Create new D1 instance for org
  3. Import data with `organizationId` set to NULL (since it's now isolated)
  4. Update org record to point to new database connection

---

## Tech Stack Notes

- **Database:** Cloudflare D1 (SQLite)
- **ORM:** Drizzle (recommended for D1 + better-auth)
- **Auth:** better-auth with organization + admin plugins
- **IDs:** Use `cuid2` or `nanoid` for primary keys

---

## Next Steps

1. [ ] Set up better-auth with organization + admin plugins
2. [ ] Run better-auth migrations to create auth tables
3. [ ] Create Drizzle schema for app-specific tables
4. [ ] Run migrations for app-specific tables
5. [ ] Build test/question CRUD APIs
6. [ ] Build attempt submission flow
7. [ ] Build results/analytics views
