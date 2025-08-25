import { Button, Field, Input, Label } from "@headlessui/react";

export default function Loading() {
  return (
    <form className="animate-pulse space-y-4">
      <Field className="space-y-1">
        <Label>E-Mail-Adresse</Label>
        <Input
          name="email"
          type="email"
          disabled
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm"
        />
      </Field>

      <Button
        type="submit"
        disabled
        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-sm/6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 disabled:bg-blue-400"
      >
        Lädt...
      </Button>
    </form>
  );
}
