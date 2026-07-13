# innoversity LMS: Production Deployment & Security Guide

This guide describes how to configure environment variables and security settings for the production release of innoversity LMS.

---

## 1. Environment Variables Security

Currently, the application uses a `.env` file for local development. In production, committing a `.env` file with real API keys or database credentials to a Git repository is a major security risk.

### Recommended Production Setup

To keep your production deployment secure:
1. **Never commit `.env` to Git**: Confirm that `.env` is listed in your `.gitignore` file (this is already configured).
2. **Create a production `.env` directly on the server**:
   * SSH into your Ubuntu server.
   * Go to the project directory: `/root/antilms`.
   * Create and edit a `.env` file there manually using `nano .env`.
   * Set strong, unique production values for all keys.

### Essential Production Variables

Here are the variables you **must** configure for your production release:

```env
# 1. Gemini API Key (Keep secret, do not share)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...

# 2. Database Connection String (Use a strong password)
DATABASE_URL=postgresql://lms_user:strong_production_password_here@pg-host:5432/innoversity

# 3. Secret for signing Session Cookies (Must be a long random string!)
# Generate one using: openssl rand -base64 32
SESSION_SECRET=your_long_random_production_secret_key_here

# 4. Storage directory for uploads
UPLOAD_DIR=/app/data/uploads

# 5. Default credentials (Change these for safety!)
ADMIN_PASSWORD=change_me_to_something_very_strong
TRAINER_PASSWORD=change_me_to_something_very_strong
```

---

## 2. Docker Compose Integration

Your `docker-compose.yml` is configured to load environment variables from the `.env` file via `env_file`:

```yaml
services:
  web:
    ...
    env_file:
      - .env
```

Since the `.env` file on the server is not tracked by Git, this setup is secure. Only users with root access to the server can view the secrets.

---

## 3. Disabling Test-User Registrations

Before releasing the platform to paying customers, you should disable free test-user registrations so that new learners must purchase courses.

You can manage this directly in the Admin Panel:
1. Log in as an Administrator (`andreas@kolar.biz`).
2. Go to the **Systemsteuerung** (System Settings) tab on the left.
3. In the right-hand panel, untick **„Freie Registrierung aktiv“** under **Test-User Registrierung**.
4. Click **Einstellungen speichern**.

Once disabled, the "Registrieren" option on the Login page is hidden, and any manual attempts to register will be blocked. You can reactivate this setting at any time when onboarding new test users.
