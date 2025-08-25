import { Button } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/outline";

export function Loading() {
  return (
    <Button
      title="Aktion lädt"
      disabled
      className="w-fit cursor-not-allowed p-1 text-gray-600"
    >
      <PencilIcon className="size-4" />
    </Button>
  );
}
