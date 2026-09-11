import type { FC } from 'hono/jsx';
import { imageUrl } from '../../config';
import type { TeamView } from '../../schedule/query';

/**
 * The SPA picked the label from window.innerWidth. All three are rendered and
 * the breakpoints choose, which is what it should always have been.
 */
export const TeamLabel: FC<{ team: TeamView | undefined }> = ({ team }) => (
  <>
    <span class="sm:hidden">{team?.abbreviation ?? ''}</span>
    <span class="hidden sm:inline md:hidden">{team?.shortName ?? ''}</span>
    <span class="hidden md:inline">{team?.name ?? ''}</span>
  </>
);

export const TeamButton: FC<{
  team: TeamView | undefined;
  side: 'home' | 'away';
  selected: boolean;
  disabled: boolean;
}> = ({ team, side, selected, disabled }) => {
  const style = selected
    ? `border-color: #${team?.color2 ?? '000000'}ff; background-color: #${team?.color1 ?? 'ffffff'}aa`
    : `border-color: #${team?.color1 ?? '000000'}ff`;

  return (
    <label class="team inline-block cursor-pointer" style={style}>
      <input
        type="radio"
        name="winner"
        value={side}
        checked={selected}
        disabled={disabled}
        class="sr-only"
        aria-label={team?.name ?? side}
      />
      {team?.logo ? (
        <img
          src={`${imageUrl}${team.logo}`}
          class="float-left"
          alt=""
          width="24"
          height="24"
          loading="lazy"
        />
      ) : (
        ''
      )}
      <span class={selected ? 'font-semibold text-gray-50' : ''}>
        <TeamLabel team={team} />
      </span>
    </label>
  );
};
