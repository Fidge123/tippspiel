export default async function Success({ message }: Props) {
  return (
    <div className="rounded bg-green-50 p-4">
      <p className="font-medium text-green-800 text-sm">{message}</p>
      <p className="mt-2 text-green-800 text-sm">
        Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den
        Bestätigungslink.
      </p>
    </div>
  );
}

interface Props {
  message?: string;
}
