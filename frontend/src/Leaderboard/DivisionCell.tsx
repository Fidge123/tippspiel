import { useRecoilValue } from "recoil";
import { divisionLeaderboardState } from "../State/states";

function DivisionCell({ div, user }: { user: string; div: string }) {
  const bet = useRecoilValue(divisionLeaderboardState([user, div]));
  const correct = [bet?.first, bet?.second, bet?.third, bet?.fourth].sort(
    (a, b) => (a && b ? a?.playoffSeed - b?.playoffSeed : 0)
  );
  const prefix = process.env.REACT_APP_IMG_URL;

  return (
    <td>
      <div className="items-center w-44">
        {bet?.first?.logo ? (
          <img
            src={prefix + bet.first.logo}
            className={`p-1 inline-block ${
              bet.first.id === correct[0]?.id && bet.points
                ? "border-green-500 border rounded"
                : ""
            }`}
            width="32"
            height="32"
            alt="team logo for division bet"
            onError={(event: any) => (event.target.style.display = "none")}
          ></img>
        ) : (
          "?"
        )}
        {bet?.second?.logo ? (
          <span className="text-xs">
            {" > "}
            <img
              src={prefix + bet.second.logo}
              className={`p-1 inline-block ${
                bet.second.id === correct[1]?.id && bet.points
                  ? "border-green-500 border rounded"
                  : ""
              }`}
              width="32"
              height="32"
              alt="team logo for division bet"
              onError={(event: any) => (event.target.style.display = "none")}
            ></img>
          </span>
        ) : (
          " > ?"
        )}
        {bet?.third?.logo ? (
          <span className="text-xs">
            {" > "}
            <img
              src={prefix + bet.third.logo}
              className={`p-1 inline-block ${
                bet.third.id === correct[2]?.id && bet.points
                  ? "border rounded border-green-500"
                  : ""
              }`}
              width="32"
              height="32"
              alt="team logo for division bet"
              onError={(event: any) => (event.target.style.display = "none")}
            ></img>
          </span>
        ) : (
          " > ?"
        )}
        {bet?.fourth?.logo ? (
          <span className="text-xs">
            {" > "}
            <img
              src={prefix + bet.fourth.logo}
              className={`p-1 inline-block ${
                bet.fourth.id === correct[3]?.id && bet.points
                  ? "border-green-500 border rounded"
                  : ""
              }`}
              width="32"
              height="32"
              alt="team logo for division bet"
              onError={(event: any) => (event.target.style.display = "none")}
            ></img>
          </span>
        ) : (
          " > ?"
        )}
      </div>
    </td>
  );
}

export default DivisionCell;
