function MatchupInput({ points, setPoints }: any) {
  return (
    <input
      className="h-10 p-px ml-1 text-center border-gray-700 rounded w-11"
      type="number"
      value={points ?? ""}
      onChange={(ev) => {
        const p = isNaN(parseInt(ev.target.value, 10))
          ? setPoints(undefined)
          : parseInt(ev.target.value, 10);
        if (p && p <= 5 && p >= 1) {
          setPoints(p);
        }
      }}
    ></input>
  );
}

export default MatchupInput;
