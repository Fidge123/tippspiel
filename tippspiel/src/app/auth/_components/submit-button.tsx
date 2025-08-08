"use client";

import { Button } from "@headlessui/react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, disabled = false }: Props) {
  const status = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || status.pending}
      className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </Button>
  );
}

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
}
