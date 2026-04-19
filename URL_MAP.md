# QueryCanvas — URL Map

Give each student only the URL(s) for the topic they should access. The landing page (`/`) just shows the app name; it has no navigation to any topic.

Replace `YOUR-DOMAIN` with the deployed host (e.g. `querycanvas.onrender.com`).

## Basics

| Query       | URL                                               |
|-------------|---------------------------------------------------|
| SELECT      | `https://YOUR-DOMAIN/q/8f3a2b9c4d5e6f1a`          |
| WHERE       | `https://YOUR-DOMAIN/q/a2b4c6d8e0f13579`          |
| ORDER BY    | `https://YOUR-DOMAIN/q/1a3b5c7d9e0f2a4b`          |

## Grouping

| Query         | URL                                             |
|---------------|-------------------------------------------------|
| Aggregations  | `https://YOUR-DOMAIN/q/4c9e2b7a1f8d0c3e`        |
| GROUP BY      | `https://YOUR-DOMAIN/q/7d1f4a8c2e5b9037`        |

## Combining

| Query           | URL                                           |
|-----------------|-----------------------------------------------|
| JOINs           | `https://YOUR-DOMAIN/q/0e8b3a5d7c2f1649`      |
| Set Operations  | `https://YOUR-DOMAIN/q/5b7f9c2a4e1d8063`      |

## Advanced SQL

| Query         | URL                                             |
|---------------|-------------------------------------------------|
| Subqueries    | `https://YOUR-DOMAIN/q/9a4c7e1b3d8f0526`        |
| CTEs          | `https://YOUR-DOMAIN/q/2d5a8f1c4b7e9036`        |
| Window Fns    | `https://YOUR-DOMAIN/q/6c0b3e5a8d1f4927`        |
| CASE WHEN     | `https://YOUR-DOMAIN/q/3e7a1c5f9d2b8046`        |

## Transformation

| Query          | URL                                            |
|----------------|------------------------------------------------|
| Data Cleaning  | `https://YOUR-DOMAIN/q/f0a3d6b9c2e5f148`       |
| String Fns     | `https://YOUR-DOMAIN/q/b1e4a7c0d3f68925`       |
| Numeric Fns    | `https://YOUR-DOMAIN/q/c5a8e1b4f7d03629`       |
| Date & Time    | `https://YOUR-DOMAIN/q/d9c2f5a8b1e47036`       |

## Architecture

| Query            | URL                                          |
|------------------|----------------------------------------------|
| Views            | `https://YOUR-DOMAIN/q/a6d9c3f0b4e72815`     |
| Indexing         | `https://YOUR-DOMAIN/q/e3b6f9a2c5d81047`     |
| ACID & Modeling  | `https://YOUR-DOMAIN/q/f2a5d8c1b4e70369`     |

## Use Cases

| Query      | URL                                                |
|------------|----------------------------------------------------|
| Analytics  | `https://YOUR-DOMAIN/q/0b4e7a1d5c8f2936`           |

---

### Security note

These tokens are **obfuscation, not encryption**. They prevent casual URL-guessing (a student on one topic can't bump to another by editing the URL), but anyone who opens browser DevTools can extract every token from the shipped JS bundle. For true per-student access control, a backend with auth is needed.

### Rotating tokens

If a token leaks, edit the corresponding entry in [src/routes.ts](src/routes.ts) (the `TOKENS` map) and update this file. All old URLs stop working immediately on the next deploy.
