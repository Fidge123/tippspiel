import { Description, Field, Label, Switch } from "@headlessui/react";

export function SettingsLoading({
  label,
  description,
  enabled = false,
}: Props) {
  return (
    <Field className="mt-6 grid w-full grid-cols-[1fr_44px] gap-2">
      <Label className="font-semibold">{label}</Label>
      <Switch
        checked={enabled}
        disabled
        className="group inline-flex h-6 w-11 animate-pulse items-center rounded-full bg-gray-200 transition data-checked:bg-blue-600"
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
  description?: string;
  enabled?: boolean;
}
