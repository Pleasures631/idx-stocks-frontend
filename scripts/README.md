# Auth E2E test

Run a local Mailpit inbox first:

```powershell
docker run --rm --name stockdash-mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit
```

Set the backend test provider in `indonesia-stocks-api/.env`:

```env
EMAIL_PROVIDER=mailpit
MAILPIT_SMTP_HOST=localhost
MAILPIT_SMTP_PORT=1025
MAILPIT_SENDER_EMAIL=no-reply@yappingsaham.test
```

Start the API and dashboard, then run from `indonesia-stocks-dashboard`:

```powershell
npm run test:auth
```

The script creates a unique test address, fills registration, reads the OTP
from Mailpit, verifies registration, and logs in. Remove `EMAIL_PROVIDER` or
set it back to `brevo` before normal email testing.
