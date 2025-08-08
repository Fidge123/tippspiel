"use client";

import { Button } from "@headlessui/react";
import { useEffect, useState } from "react";

export function SubmitButton({ children, disabled = false }: Props) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect only runs on the client after hydration
    setIsHydrated(true);
  }, []);

  const isDisabled = disabled || !isHydrated;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
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
