# My bug report — 12

You reported 11 confirmed bugs. For Phase 2, write an automated test that FAILS because of each one — fixing them is an optional bonus.

## 1. POST /api/login — missing-required-field

Issue: The login endpoint fails to enforce password as a required non-empty field, permitting authentication with an empty or missing password.
Expected vs actual: Expected: Blank or missing password payload (e.g. {"username": "admin", "password": ""}) to return HTTP 401 {"error": "Invalid credentials"}.
Actual: Returns HTTP 200 OK with a valid session token because an empty string matches substring checks.

## 2. GET /api/candidates/:id — access-control

Issue: The GET /api/candidates/:id endpoint lacks authentication enforcement, allowing any unauthenticated visitor to retrieve candidate records.
Expected vs actual: Expected: Per spec, GET /api/candidates/:id requires a valid token; missing or invalid tokens must return HTTP 401 Unauthorized.
Actual: Requesting GET /api/candidates/1 without an Authorization header returns HTTP 200 OK with the candidate payload.

## 3. POST /api/candidates — access-control

Issue: The candidate creation endpoint does not enforce role gating against the VIEWER role or unauthenticated requests.
Expected vs actual: Expected: Per spec, candidate creation is allowed for AGENT and ADMIN only; VIEWER must return HTTP 403 Forbidden.
Actual: Submitting POST /api/candidates with a VIEWER token returns HTTP 201 Created and saves the new candidate.

## 4. PATCH /api/candidates/:id — access-control

Issue: The role gate on PATCH /api/candidates/:id incorrectly rejects authorized roles (ADMIN and AGENT) with 403 Forbidden due to inverted or faulty boolean check logic.
Expected vs actual: Expected: Per spec, PATCH /api/candidates/:id is allowed for AGENT or ADMIN to update candidate status with HTTP 200.
Actual: Both ADMIN and AGENT receive HTTP 403 {"error": "Forbidden"} when attempting to update status.

## 5. DELETE /api/candidates/:id — access-control

Issue: The candidate deletion endpoint rejects ADMIN users with HTTP 403 Forbidden instead of allowing deletion.
Expected vs actual: Expected: Per spec, DELETE /api/candidates/:id is allowed for ADMIN only and should successfully delete the candidate.
Actual: An authenticated ADMIN user receives HTTP 403 {"error": "Forbidden"}.

## 6. GET /api/users — wrong-status-code

Issue: Access denial on GET /api/users returns HTTP status code 200 OK containing an error object body instead of HTTP 403 Forbidden.
Expected vs actual: Expected: Unauthorized or non-admin access to GET /api/users must return HTTP status 403 Forbidden.
Actual: Returns HTTP status 200 OK with body {"error": "Forbidden"}.

## 7. UI — missing-ui-feedback-guard

Issue: In app.js, failed login responses trigger an early return ("if (!res.ok) return;") without displaying the #login-error message element.
Expected vs actual: Expected: Per UI spec, on a failed login, a visible error message is shown to the user (the form never just silently does nothing).
Actual: The login button click handler silently does nothing and #login-error remains hidden.

## 8. UI — case-sensitivity-mismatch

Issue: In enterDashboard(), the button visibility toggle checks role !== 'Admin' (title-case), but the API returns uppercase 'ADMIN'.
Expected vs actual: Expected: Per UI spec, the "Manage Users" button is visible to ADMIN users.
Actual: Because 'ADMIN' !== 'Admin' evaluates to true, the 'hidden' class is always applied, hiding the button from ADMIN users.

## 9. UI — access-control

Issue: In renderCandidates(), canDelete is evaluated as (role === 'ADMIN' || role === 'AGENT'), exposing the Delete button to AGENT users.
Expected vs actual: Expected: Per UI spec, each candidate row's Delete button is visible only to ADMIN.
Actual: Both ADMIN and AGENT users have the Delete button rendered and visible on each candidate row.

## 10. UI — state-not-persisted

Issue: The logout click handler toggles UI element visibility but fails to remove token, role, and username from localStorage.
Expected vs actual: Expected: Per UI spec, clicking Logout fully clears the session from localStorage so stale session credentials cannot be reused.
Actual: token, role, and username remain in localStorage and page reload automatically logs back in.

## 11. GET /api/users — leaks-hidden-field

Issue: The GET /api/users endpoint leaks the sensitive plaintext password field in each user record within the returned users array.
Expected vs actual: Expected: Per spec, GET /api/users returns 200 {"users": [{"id", "username", "role"}]} with the password field never included in the response.
Actual: The response body includes the plaintext "password" property for every user (e.g. "password": "admin123").

