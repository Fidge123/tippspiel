# Delivery check

One mail through the real SMTP2GO account, to confirm that the application can still send.

```
SMTP2GO_API_KEY=... EMAIL=... bun run test:delivery
```

## What it covers

That sending works end to end: the key is valid, `src/email/send.ts` builds a request SMTP2GO accepts, and SMTP2GO gets the mail to the recipient.
Nothing else belongs here.
The payload is pinned by `src/email/send.test.ts` and the wording of each mail by the route tests, both without sending anything.

This is a check on a third party, not on a change, so it does not run per pull request.
`.github/workflows/email.yml` runs it on Wednesdays and Fridays from August to February, which is the season, and it can be started by hand from the Actions tab at any time.
A failure means the mail the application sends is not reaching anyone, which is [#97](https://github.com/Fidge123/tippspiel/issues/97) happening again.

## How it works

The check sends to `EMAIL`, the address the admin alerts already go to, with a run specific subject.
It then polls [activity search](https://developers.smtp2go.com/docs/view-account-activity) for that subject until SMTP2GO reports `delivered`, which is the same account and key the sending itself uses.

So no inbox is ever read and no second service is involved.
An earlier version used a throwaway inbox from a mail testing service, which stopped answering.
Trusting the provider's own record of the delivery is a weaker assertion than reading the mail, but it needs no credentials beyond the ones the application already has.

`hard-bounced`, `rejected` and `spam` fail immediately, because the mail is never going to arrive after those.
Anything else is treated as still in flight until the timeout.

Accounts on the free plan keep five days of activity, far more than the check needs.
