function MatchupInput({ points, setPoints }: any) {
  return (
    <input
      className="h-10 w-11 ml-1 p-px text-center border dark:bg-gray-300 border-gray-700 rounded text-black"
      type="number"
      value={points ?? ""}
      onChange={(ev) => {
        const p = isNaN(parseInt(ev.target.value, 10))
          ? undefined
          : parseInt(ev.target.value, 10);
        if (p && p <= 5 && p >= 1) {
          setPoints(p);
        }
      }}
    ></input>
  );
}

export default MatchupInput;
