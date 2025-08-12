import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="m-auto flex max-w-4xl flex-col py-16">
      <Link
        href="/terms/de"
        className="pb-8 font-medium text-blue-600 underline hover:text-blue-500"
      >
        Für die deutsche Version klicken Sie hier.
      </Link>
      <div className="prose prose-gray max-w-none">
        <h1 className="font-bold text-2xl">
          Terms of Service and Privacy Policy
        </h1>

        <h2 className="mt-6 font-bold text-xl">1. Privacy Policy</h2>

        <h3 className="mt-4 font-semibold text-lg">Data Controller</h3>
        <p>
          Florian Richter
          <br />
          George-Stephenson-Straße 7<br />
          10557 Berlin, Germany
          <br />
          Email: admin@nfl-tippspiel.de
        </p>

        <h3 className="mt-4 font-semibold text-lg">
          Data Collection and Processing
        </h3>
        <p>
          This website collects and processes personal data for the following
          purposes:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>User Registration and Management:</strong> Username and
            email address for account creation and management
          </li>
          <li>
            <strong>Technical Logging:</strong> IP addresses are stored in
            server logs for security and troubleshooting
          </li>
          <li>
            <strong>Functionality:</strong> Login tokens are stored in cookies
            to keep you logged in
          </li>
          <li>
            <strong>Anonymous Usage Statistics:</strong> Analytics data without
            storing personal data
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">
          Legal Basis for Processing
        </h3>
        <p>Processing is based on the following legal grounds:</p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Art. 6(1)(b) GDPR:</strong> Contract performance (providing
            the prediction game functionality)
          </li>
          <li>
            <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interests (security,
            functionality, anonymous statistics)
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">
          Data Sharing and Third Countries
        </h3>
        <p>
          Your data is generally not shared with third parties. The following
          technical service providers are used:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Backup Storage:</strong> CloudFlare, Inc.
          </li>
          <li>
            <strong>Hosting:</strong> Hetzner Online GmbH
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">Data Retention</h3>
        <p>Personal data is stored:</p>
        <ul className="list-disc pl-6">
          <li>Until account deletion by the user, or</li>
          <li>Automatically after 3 years of account inactivity</li>
          <li>Server logs are regularly rotated and deleted</li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">Your Rights</h3>
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Access</strong> (Art. 15 GDPR): What data is stored about
            you
          </li>
          <li>
            <strong>Rectification</strong> (Art. 16 GDPR): Correction of
            inaccurate data
          </li>
          <li>
            <strong>Erasure</strong> (Art. 17 GDPR): Deletion of your data under
            certain conditions
          </li>
          <li>
            <strong>Data Portability</strong> (Art. 20 GDPR): Export of your
            data in structured format
          </li>
          <li>
            <strong>Objection</strong> (Art. 21 GDPR): Object to processing
            based on legitimate interests
          </li>
          <li>
            <strong>Complaint</strong> (Art. 77 GDPR): With the competent data
            protection authority
          </li>
        </ul>
        <p>To exercise your rights, contact: admin@nfl-tippspiel.de</p>

        <h3 className="mt-4 font-semibold text-lg">Cookies</h3>
        <p>
          This website uses cookies exclusively for storing login tokens. This
          usage falls under the legitimate interests of the website operators
          and does not require explicit consent according to TTDSG. By
          continuing to use the website, you agree to the use of these
          technically necessary cookies.
        </p>

        <h2 className="mt-6 font-bold text-xl">2. Terms of Service</h2>

        <h3 className="mt-4 font-semibold text-lg">Website Purpose</h3>
        <p>
          This website provides a private, non-commercial platform for American
          Football prediction games among friends.
        </p>

        <h3 className="mt-4 font-semibold text-lg">User Account</h3>
        <p>By registering, you create a user account. You are obligated to:</p>
        <ul className="list-disc pl-6">
          <li>Provide truthful information</li>
          <li>Keep your login credentials secret</li>
          <li>Notify us immediately of any unauthorized access</li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">Trademarks and Copyright</h3>
        <p>
          NFL and the NFL shield design are registered trademarks of the
          National Football League. The team names, logos and uniform designs
          are registered trademarks of the teams indicated. All other
          NFL-related trademarks are trademarks of the National Football League.
        </p>
        <p>
          This website includes material owned by the National Football League
          which is protected under applicable copyright. This material is used
          only nominatively. This website is neither sponsored nor endorsed by
          the National Football League. This website does not own or claim
          ownership of any names or logos that are registered trademarks of the
          National Football League.
        </p>

        <h3 className="mt-4 font-semibold text-lg">Limitation of Liability</h3>
        <p>
          This website is operated privately and non-commercially. Liability for
          availability, functionality, or data loss is excluded to the extent
          permitted by law.
        </p>

        <h3 className="mt-4 font-semibold text-lg">Contact</h3>
        <p>
          If you have questions about these terms or copyright concerns, please
          contact: admin@nfl-tippspiel.de
        </p>
      </div>
    </main>
  );
}
