import { useRecoilState } from "recoil";

import { hiddenState } from "../State/states";

function HideButton({ id, start }: Props) {
  const [hidden, setHidden] = useRecoilState(hiddenState(id));

  if (start < new Date()) {
    return (
      <button
        onClick={() => setHidden(!hidden)}
        className={`border border-gray-800 dark:border-black rounded ${
          hidden
            ? "text-white dark:text-white bg-gray-600 dark:bg-gray-900"
            : "text-gray-800 dark:text-gray-900 bg-gray-100 dark:bg-gray-400"
        }`}
      >
        Spoilerschutz {hidden ? "an" : "aus"}
      </button>
    );
  }
  return <></>;
}

interface Props {
  id: string;
  start: Date;
}

export default HideButton;
