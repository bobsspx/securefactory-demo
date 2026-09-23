# SecureFactory

SecureFactory is a security-focused industrial operations web application built as a portfolio project to demonstrate secure full-stack development, authentication, authorization, audit logging, production data management, and defensive web security practices.

## Live Demo

Production deployment:

`https://securefactory-demo.vercel.app`

SecureFactory is a demonstration environment. Accounts and production data used by the project are synthetic and are not connected to a real industrial production system.

## Overview

SecureFactory combines an industrial operations dashboard with application-level security controls.

The system demonstrates:

* Secure authentication
* Role-Based Access Control (RBAC)
* Session revocation
* Persistent login rate limiting
* Security audit logging
* User lifecycle management
* Production record management
* PostgreSQL-backed dashboard metrics
* Input validation
* Defensive HTTP security headers
* Automated testing
* Production deployment

## Technology Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| Framework         | Next.js 16                 |
| UI                | React 19                   |
| Language          | TypeScript                 |
| Database          | PostgreSQL                 |
| Database Platform | Neon Serverless PostgreSQL |
| Authentication    | JWT + bcrypt               |
| JWT Library       | JOSE                       |
| Testing           | Vitest                     |
| Hosting           | Vercel                     |
| Source Control    | GitHub                     |

## Application Roles

SecureFactory uses three roles.

| Capability                | Admin | Operator | Viewer |
| ------------------------- | ----: | -------: | -----: |
| View dashboard            |   Yes |      Yes |    Yes |
| View production records   |   Yes |      Yes |    Yes |
| Create production records |   Yes |      Yes |     No |
| Update production records |   Yes |      Yes |     No |
| View security information |   Yes |      Yes |     No |
| View audit logs           |   Yes |       No |     No |
| View users                |   Yes |       No |     No |
| Manage users              |   Yes |       No |     No |

Authorization is enforced by the server-side API. Hiding an action in the UI is not treated as an authorization control.

## Authentication

Users authenticate using an email address and password.

Passwords are stored as bcrypt hashes.

After successful authentication, the application creates a signed JWT session.

The JWT contains:

* User ID
* Email
* Role
* Session version
* Issued-at timestamp
* Expiration
* Unique JWT ID

JWT verification restricts accepted tokens by:

* Algorithm
* Issuer
* Audience
* Expiration
* Payload validation

Production sessions use an HttpOnly Secure cookie with the `__Host-` prefix.

## Session Revocation

Each user has a `session_version` value stored in PostgreSQL.

For authenticated API requests, SecureFactory compares the session claims against the current database user.

A session becomes invalid when:

* The user is disabled
* The user is removed
* The user's role changes
* The database session version changes
* Important user identity fields no longer match

Role or account status changes automatically increase the user's session version, invalidating existing sessions.

## Role-Based Access Control

Permissions include:

```text
dashboard.read
production.read
production.write
security.read
audit.read
users.read
users.manage
```

The permission matrix is implemented centrally and reused by protected application routes.

Unauthorized access attempts return:

```text
401 — Authentication required / invalid / revoked session
403 — Authenticated but insufficient permissions
```

Denied authorization attempts are also recorded in the security audit log.

## Login Rate Limiting

SecureFactory implements persistent login rate limiting using PostgreSQL.

A login identifier is generated with HMAC-SHA256 using:

```text
client IP + normalized email + RATE_LIMIT_SECRET
```

The raw IP/email pair is not used directly as the database rate-limit key.

The current demonstration policy allows five login attempts in a ten-minute window. Additional attempts are blocked until the window expires.

Rate-limit state persists across application instances because it is stored in PostgreSQL.

## Security Audit Logging

Security-sensitive actions are recorded in PostgreSQL.

Events include:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
LOGIN_RATE_LIMITED
LOGOUT
INVALID_SESSION
SESSION_REVOKED
AUTHORIZATION_DENIED
USER_ROLE_CHANGED
USER_DISABLED
USER_ENABLED
PRODUCTION_RECORD_CREATED
PRODUCTION_RECORD_UPDATED
```

Audit information includes contextual details such as:

* Event type
* Masked email
* Masked IP address
* Event details
* Severity
* Timestamp

Sensitive email and IP information is masked before being written to security event output.

## User Management

Admin users can manage application accounts from the admin console.

Supported operations include:

* View users
* Change user roles
* Enable accounts
* Disable accounts
* Revoke existing sessions through session-version changes

The application prevents an administrator from modifying their own account through the user-management interface and contains safeguards against removing the final active administrator.

Password hashes are never returned by the user-management API.

## Production Management

Admin and Operator accounts can create and update production records.

Viewer accounts have read-only access.

Production records contain:

```text
Production date
Production line
Product name
Planned units
Produced units
Rejected units
Production status
Created by
Updated by
Created timestamp
Updated timestamp
```

Application validation checks values before database writes.

Database constraints provide an additional validation layer.

For example:

```text
planned_units > 0
produced_units >= 0
rejected_units >= 0
rejected_units <= produced_units
```

## Production Dashboard Metrics

Dashboard metrics are calculated from PostgreSQL rather than hard-coded values.

SecureFactory calculates metrics for the latest production date available in the database.

Metrics include:

| Metric            | Calculation                          |
| ----------------- | ------------------------------------ |
| Latest Production | Sum of produced units                |
| Efficiency        | Produced / Planned × 100             |
| Active Lines      | Distinct lines with `running` status |
| Reject Rate       | Rejected / Produced × 100            |

The admin dashboard and production metrics API use the same underlying calculation logic.

## Defensive Web Security

The production deployment applies security headers including:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
Cross-Origin-Opener-Policy
X-DNS-Prefetch-Control
X-Permitted-Cross-Domain-Policies
```

Administrative and API routes also return:

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

This discourages indexing of internal application surfaces.

## Request Protection

State-changing API endpoints use same-origin request validation.

The application also uses:

* Parameterized PostgreSQL queries
* UUID validation
* Server-side input validation
* Database constraints
* HttpOnly cookies
* Secure production cookies
* `Cache-Control: no-store` for sensitive responses

## Environment Configuration

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Required variables:

```text
DATABASE_URL=
SESSION_SECRET=
RATE_LIMIT_SECRET=
```

`SESSION_SECRET` and `RATE_LIMIT_SECRET` must contain at least 32 characters.

Real secrets must never be committed to Git.

## Local Development

Install dependencies:

```bash
npm install
```

Create the local environment file:

```text
.env.local
```

Start development:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Verification

Run automated tests:

```bash
npm test
```

Run static linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The current automated suite contains 45 tests covering areas including:

* Authentication
* Authorization
* RBAC
* Session-user validation
* Login rate limiting
* Security logging
* User management
* Production validation
* Dashboard metric calculations

A dependency audit performed during the Version 1.0 hardening phase reported zero known npm vulnerabilities at the time of verification.

## Architecture

Detailed architecture documentation is available at:

```text
docs/architecture.md
```

Security implementation and residual risks are documented in:

```text
docs/security-assessment.md
```

## Security Scope

SecureFactory is a defensive cybersecurity and software-engineering portfolio project.

Testing was performed only against project infrastructure and environments controlled or authorized by the developer.

No offensive testing was performed against third-party systems.

## Project Status

**SecureFactory v1.0.0 — Portfolio Release**

The Version 1.0 release includes secure authentication, RBAC, session revocation, persistent rate limiting, audit logging, user management, production management, database-backed metrics, application validation, defensive browser security controls, automated testing, and production deployment.

Future development may explore MFA, CI security scanning, SIEM integration, end-to-end testing, and multi-tenant authorization.
