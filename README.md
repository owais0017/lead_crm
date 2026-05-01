# Mini Lead CRM — Backend Intern Assessment (Superleap)

A RESTful API for a simplified Lead Management CRM. Leads represent potential customers moving through a sales pipeline. The API supports creating, reading, updating, deleting, and transitioning leads through defined stages.

---

## Tech Stack

**Runtime — Node.js**
Lightweight and fast for building REST APIs. JavaScript across the stack keeps things simple and consistent.

**Framework — Express**
Handles routing, request parsing, and responses cleanly. Minimal boilerplate so the focus stays on business logic.

**Database — SQLite (better-sqlite3)**
A single-file local database — no separate database server required. Perfect for this scope: synchronous API, simple queries, zero setup overhead.

**Other — uuid, nodemon**
`uuid` generates unique IDs for each lead. `nodemon` auto-restarts the server on file changes during development.

---

## Project Structure