# autoscout.mk

A responsive, independent domain-sale landing page for **autoscout.mk**. Visitors can ask for a purchase price, discuss a lease, and submit an inquiry directly to the domain owner. Pricing is intentionally not fixed.

## Local development

Requires Node.js 22 or newer. No runtime dependencies or database required.

```sh
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The landing page works without environment variables; email submission requires valid credentials. Run `npm test` to test validation and mocked email delivery.

## Enable email delivery

1. Create a Resend account and verify a sender domain you control.
2. Create a Resend API key with sending access.
3. Configure these server-side environment variables in `.env.local` for development, and Vercel Project Settings → Environment Variables for production:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Secret Resend API key |
| `CONTACT_FROM_EMAIL` | Sender on a verified Resend domain, e.g. `Domain inquiries <inquiries@your-verified-domain>` |
| `CONTACT_TO_EMAIL` | Your real inbox for inquiries |

Never commit `.env.local` or any API keys. The function delivers plain-text emails and sets Reply-To to the visitor's email address. The form reports delivery errors rather than displaying false success. Provider acceptance is not a guarantee of inbox placement. The honeypot and basic validation are not comprehensive spam prevention; configure platform rate limiting or a server-verified CAPTCHA before exposing the form to significant traffic.

## Deploy to Vercel (when ready)

1. Push this project to your GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository and select the **Other** framework preset. No build command is needed; serve the project root (leave output directory at its default).
3. Add the three email environment variables above, select Node.js 22+ and deploy.
4. Verify that the generated Vercel URL loads and send a real test inquiry.
5. When you decide to connect autoscout.mk, use Vercel's Domains settings and follow the exact DNS instructions there. Preserve existing mail records.

No deployment or DNS configuration has been performed. The sender domain used for email can be different from autoscout.mk.

## Files

- `index.html`, `style.css`, `app.js`: landing page and inquiry form
- `api/inquiry.js`: Vercel serverless email endpoint
- `dev.mjs`: lightweight local development server
- `vercel.json`: deployment configuration and security headers
- `test/inquiry.test.js`: server-side validation and mocked delivery tests

## Before public launch

Verify that you have the right to market, lease and transfer the domain under applicable registry policies and trademark law. Similar automotive brands may have rights in this name; the independent-listing disclaimer is not legal clearance. Review the privacy notice and configure suitable anti-abuse protections. No visitor data is saved to a database by this project; email providers and your inbox may retain submissions.
