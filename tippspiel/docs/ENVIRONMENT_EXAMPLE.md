# Environment Variables Example

This file contains example values for all environment variables required by the Tippspiel application.

Copy this to `.env.local` (for development) or set these in your production environment.

## Database

```bash
# PostgreSQL database URL
DATABASE_URL="postgresql://username:password@localhost:5432/tippspiel"
```

## Authentication

```bash
# NextAuth.js secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secret-key-here"

# NextAuth.js URL (optional in development)
AUTH_URL="http://localhost:3000"

# Password pepper for additional security
PASSWORD_PEPPER="your-password-pepper-here"
```

## Email Configuration (SMTP2Go)

```bash
# SMTP2Go API key from your dashboard
SMTP2GO_API_KEY="api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Sender email address (must be verified in SMTP2Go)
SMTP2GO_SENDER_EMAIL="noreply@yourdomain.com"

# Sender name displayed in emails
SMTP2GO_SENDER_NAME="Tippspiel Team"
```

## Application URLs

```bash
# Server-side application URL
APP_URL="http://localhost:3000"

# Client-side application URL (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Development

```bash
# Node environment
NODE_ENV="development"

# Skip environment validation (useful for Docker builds)
# SKIP_ENV_VALIDATION=true
```

## Production Example

For production, your `.env` file might look like:

```bash
DATABASE_URL="postgresql://user:pass@prod-db:5432/tippspiel"
AUTH_SECRET="generated-secret-key-32-chars-minimum"
AUTH_URL="https://tippspiel.yourdomain.com"
PASSWORD_PEPPER="your-production-pepper"
SMTP2GO_API_KEY="api-your-production-api-key"
SMTP2GO_SENDER_EMAIL="noreply@yourdomain.com"
SMTP2GO_SENDER_NAME="Tippspiel"
APP_URL="https://tippspiel.yourdomain.com"
NEXT_PUBLIC_APP_URL="https://tippspiel.yourdomain.com"
NODE_ENV="production"
```

## Security Notes

- Never commit actual environment variables to version control
- Use strong, unique secrets for AUTH_SECRET and PASSWORD_PEPPER
- Keep SMTP2Go API keys secure and rotate them regularly
- Use HTTPS URLs in production
- Verify sender domains in SMTP2Go dashboard for better deliverability

## SMTP2Go Setup

1. Sign up at https://www.smtp2go.com/
2. Verify your sender email/domain
3. Generate API key in dashboard
4. Configure SPF/DKIM records for your domain (optional but recommended)
5. Test email sending in SMTP2Go dashboard