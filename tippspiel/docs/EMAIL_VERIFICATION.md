# Email Verification System

This document describes the email verification system implemented in the Tippspiel project using SMTP2Go.

## Overview

The email verification system automatically sends verification emails to users after registration and provides mechanisms for users to verify their email addresses and resend verification emails if needed.

## Architecture

### Components

1. **SMTP2Go Integration** (`src/server/email/smtp2go.ts`)
   - Handles sending emails via SMTP2Go API
   - Manages API responses and error handling

2. **Email Templates** (`src/server/email/templates.ts`)
   - Markdown-based email templates
   - Variable substitution system
   - Converts markdown to HTML and plain text

3. **Email Service** (`src/server/email/index.ts`)
   - Main email service interface
   - Combines SMTP2Go and template systems

4. **Database Schema**
   - `user` table: includes `verified` boolean field
   - `verify` table: stores verification tokens

5. **API Procedures**
   - `user.register`: Creates user and sends verification email
   - `user.verify`: Verifies email with token
   - `user.resendVerification`: Resends verification email

6. **User Interface**
   - `/auth/verify`: Email verification page
   - `/auth/resend-verification`: Resend verification page

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# SMTP2Go Configuration
SMTP2GO_API_KEY=your-smtp2go-api-key
SMTP2GO_SENDER_EMAIL=noreply@yourdomain.com
SMTP2GO_SENDER_NAME=Tippspiel Team

# Application URL (server-side)
APP_URL=https://yourdomain.com

# Application URL (client-side)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Email Templates

Email templates are stored as Markdown files in `src/server/email/templates/`.

### Template Variables

Templates support variable substitution using `{{variableName}}` syntax:

- `{{userName}}`: User's display name
- `{{verificationUrl}}`: Complete verification URL with token
- `{{appUrl}}`: Application base URL

### Available Templates

- `verification.md`: Email verification template

### Creating New Templates

1. Create a new `.md` file in `src/server/email/templates/`
2. Use `{{variableName}}` for dynamic content
3. Create a corresponding function in `templates.ts`

Example:
```typescript
export async function createWelcomeEmail(
  userName: string,
  customVar: string,
): Promise<EmailTemplate> {
  return await renderEmailTemplate(
    "welcome",
    { userName, customVar },
    "Welcome to Tippspiel!"
  );
}
```

## Usage

### Registration Flow

1. User submits registration form
2. System creates user account with `verified: false`
3. System generates verification token and stores in `verify` table
4. System sends verification email using SMTP2Go
5. User receives email and clicks verification link
6. System verifies token and sets `verified: true`
7. Token is removed from database

### API Usage

```typescript
// Register user (automatically sends verification email)
await api.user.register({
  email: "user@example.com",
  name: "User Name",
  password: "password123",
  consent: new Date()
});

// Verify email
await api.user.verify({
  token: "verification-token-from-email"
});

// Resend verification email
await api.user.resendVerification({
  email: "user@example.com"
});
```

### Direct Email Sending

```typescript
import { sendVerificationEmail } from "~/server/email";

await sendVerificationEmail(
  "user@example.com",
  "User Name", 
  "verification-token"
);
```

## Security Features

### Token Expiration
- Verification tokens expire after 24 hours
- Expired tokens are automatically cleaned up during verification attempts

### Rate Limiting
- Resend verification emails are rate-limited to once per 5 minutes per user
- Prevents spam and abuse

### Token Security
- Tokens are generated using cryptographically secure random bytes (32 bytes)
- Tokens are single-use and deleted after successful verification

## Error Handling

### SMTP2Go Errors
- API errors are caught and logged
- Registration continues even if email fails (user can resend later)
- Detailed error messages for debugging

### Verification Errors
- Invalid tokens return appropriate error messages
- Expired tokens are handled gracefully
- User-friendly German error messages

### Common Error Scenarios

| Error | Cause | User Message |
|-------|-------|-------------|
| `NOT_FOUND` | Invalid token | "Der Bestätigungslink ist ungültig." |
| `BAD_REQUEST` | Token expired | "Der Bestätigungslink ist abgelaufen." |
| `TOO_MANY_REQUESTS` | Rate limit hit | "Bitte warten Sie 5 Minuten..." |
| `CONFLICT` | Email already exists | "Diese E-Mail-Adresse wurde bereits registriert." |

## Testing

### Unit Tests

Run email template tests:
```bash
bun test src/server/email/templates.spec.ts
```

### Manual Testing

1. Set up SMTP2Go account and get API key
2. Configure environment variables
3. Register a new user
4. Check email inbox for verification email
5. Click verification link
6. Verify user status in database

### Test Email Template

Test template rendering without sending emails:
```typescript
import { createVerificationEmail } from "~/server/email/templates";

const email = await createVerificationEmail(
  "Test User",
  "test-token",
  "https://localhost:3000"
);

console.log("Subject:", email.subject);
console.log("HTML:", email.html);
console.log("Text:", email.text);
```

## Troubleshooting

### Email Not Sending

1. Verify SMTP2Go API key is correct
2. Check sender email is verified in SMTP2Go dashboard
3. Check application logs for SMTP2Go API errors
4. Verify environment variables are loaded correctly

### Email Not Received

1. Check spam/junk folder
2. Verify sender reputation in SMTP2Go dashboard
3. Check recipient email address is valid
4. Review SMTP2Go sending logs

### Template Errors

1. Verify template file exists in correct location
2. Check file permissions
3. Validate markdown syntax
4. Ensure all variables are provided

### Database Issues

1. Verify `verify` table exists and is accessible
2. Check foreign key constraints
3. Monitor for token cleanup issues

## Production Considerations

### Performance
- Email sending is async and doesn't block registration
- Consider implementing email queue for high volume
- Monitor SMTP2Go API rate limits

### Monitoring
- Log email sending success/failure rates
- Monitor verification conversion rates
- Track token expiration patterns

### Scalability
- Consider batch cleanup of expired tokens
- Implement email queue for high-volume scenarios
- Monitor database performance for verification operations

## SMTP2Go Configuration

### Account Setup
1. Create SMTP2Go account at https://www.smtp2go.com/
2. Verify your sender domain/email
3. Generate API key in dashboard
4. Configure SPF/DKIM records for better deliverability

### API Limits
- Check your SMTP2Go plan limits
- Monitor sending volume
- Implement appropriate error handling for quota exceeded scenarios

### Best Practices
- Use a dedicated sender address (e.g., noreply@yourdomain.com)
- Configure proper SPF and DKIM records
- Monitor bounce and complaint rates
- Implement unsubscribe handling if required