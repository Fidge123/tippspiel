"use client";
import { Description, Field, Label, Switch } from "@headlessui/react";
import { useState } from "react";
import { api } from "~/trpc/react";

export function Settings({ label, prop, description, enabled = false }: Props) {
  const [checked, setChecked] = useState(enabled);
  const updateSettings = api.user.updateSettings.useMutation({
    onSuccess({ settings }) {
      setChecked((settings as { [prop]: boolean })[prop] ?? enabled);
    },
  });

  return (
    <Field className="mt-6 grid w-full grid-cols-[1fr_44px] gap-2">
      <Label className="font-semibold">{label}</Label>
      <Switch
        checked={checked}
        disabled={updateSettings.isPending}
        onChange={(value) => {
          updateSettings.mutate({ [prop]: value });
        }}
        className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition disabled:animate-pulse disabled:bg-gray-400 data-checked:bg-blue-600"
      >
        <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6"></span>
      </Switch>
      {description && (
        <Description className="col-span-2 text-balance pt-1 text-gray-500 text-sm">
          {description}
        </Description>
      )}
    </Field>
  );
}

interface Props {
  label: string;
  prop: string;
  description?: string;
  enabled?: boolean;
}
