# SecureFactory — Secure Full-Stack Application Case Study

## The Problem

Industrial and business applications often need to expose operational data to different types of users while preventing unauthorized access to sensitive functions.

SecureFactory was created to demonstrate how an industrial operations application can be designed with security controls built into the application architecture rather than added only at the user-interface level.

## Project Objective

The goal was to build a portfolio application demonstrating both full-stack development and practical defensive cybersecurity skills.

The application needed to support three different user roles, production data management, administrative operations, and security monitoring while enforcing authorization on the server.

## My Role

I designed and developed the SecureFactory demonstration application, including:

* Application architecture
* Next.js frontend and backend
* PostgreSQL data model
* Authentication
* Role-Based Access Control
* Session management
* Persistent rate limiting
* Security audit logging
* Production data management
* Input validation
* Security hardening
* Automated testing
* Vercel deployment

## Security Challenge

The application needed to ensure that hiding buttons from a user was not treated as authorization.

For example, a Viewer should be able to read production information but must not be able to create or modify production records even if they manually call the API.

SecureFactory therefore enforces permissions at the API layer.

A Viewer attempting a production write receives HTTP 403, and the denied operation is recorded as an `AUTHORIZATION_DENIED` security event.

## Authentication Design

Passwords are stored using bcrypt hashes.

Successful authentication creates a signed JWT stored in an HttpOnly cookie.

JWT validation includes issuer, audience, expiration, algorithm, and application claims.

The system also validates the user against PostgreSQL on protected requests rather than trusting the JWT indefinitely.

## Session Revocation

SecureFactory implements database-backed session versioning.

Each user has a `session_version`.

When an administrator changes a user's role or disables an account, the version changes.

Existing JWTs containing an older version are then rejected.

This provides immediate session revocation without waiting for JWT expiration.

## Role-Based Access Control

The application contains three roles:

* Admin
* Operator
* Viewer

Admin users can manage users, view audit information, and manage production data.

Operator users can manage production data and view security information.

Viewer users have read-only access to production information.

The same permission model is reused by protected server-side APIs.

## Login Protection

Login attempts are protected using persistent PostgreSQL rate limiting.

Instead of using a raw email and IP address as the rate-limit database identifier, SecureFactory creates an HMAC-SHA256 value using a server-side secret.

Repeated failed login attempts eventually return HTTP 429.

## Security Monitoring

Security-relevant actions are stored as audit events.

Examples include:

* Login success
* Login failure
* Login rate limiting
* Invalid sessions
* Revoked sessions
* Authorization failures
* User role changes
* Account enable/disable actions
* Production record creation
* Production record updates

Email addresses and IP addresses are masked in audit output.

## Production Module

Admin and Operator users can create and update production records.

The application validates production data at the application level and uses database constraints as an additional layer of protection.

The production dashboard calculates metrics directly from PostgreSQL, including production output, efficiency, active lines, and reject rate.

## Security Hardening

The production deployment includes:

* Content Security Policy
* HSTS
* Clickjacking protection
* MIME sniffing protection
* Referrer Policy
* Permissions Policy
* Same-origin protection for state-changing requests
* Secure environment variable validation
* Non-indexing headers for internal routes

A dependency audit performed during the v1.0 hardening phase reported zero known npm vulnerabilities.

## Testing

The Version 1.0 release includes 45 automated tests covering authentication, authorization, RBAC, session validation, rate limiting, user management, audit logging, production validation, and production metric calculations.

Before release, the project was also verified using:

* ESLint
* Next.js production build
* Manual RBAC tests
* Database verification
* Production security-header verification
* Authorization-denial tests

## Result

SecureFactory evolved from a simple industrial website demonstration into a secure full-stack operations application.

The finished project demonstrates the ability to combine software development, database design, authentication, authorization, security monitoring, application security, and production deployment in one portfolio project.

## Technologies

Next.js • React • TypeScript • PostgreSQL • Neon • JWT • JOSE • bcrypt • Vitest • Vercel • GitHub
