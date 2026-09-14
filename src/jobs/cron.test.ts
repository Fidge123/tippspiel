import { describe, expect, it, mock, spyOn } from 'bun:test';
import { guard } from './cron';
import { JOBS, SCHEDULES } from './registry';

describe('the job schedules', () => {
  it('covers every job exactly once', () => {
    expect(Object.keys(SCHEDULES).sort()).toEqual(Object.keys(JOBS).sort());
  });

  it('carries the expressions the jobs have always run on', () => {
    expect(SCHEDULES).toEqual({
      'import-master-data': '3 7 * Aug-Dec,Jan,Feb *',
      'import-schedule': '48 7 * Aug-Dec,Jan,Feb *',
      'update-games': '*/5 * * * *',
      'bet-reminder': '0 18 * Sep-Dec,Jan,Feb *',
      'clean-up': '0 * * * *',
    });
  });

  it('writes five fields, which is what Bun.cron parses', () => {
    for (const [name, expression] of Object.entries(SCHEDULES)) {
      expect(expression.split(' '), name).toHaveLength(5);
    }
  });
});

describe('the guard around each job', () => {
  it('does not reject when the job throws', async () => {
    const logged = spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      guard('update-games', async () => {
        throw new Error('ESPN is down');
      }),
    ).resolves.toBeUndefined();

    expect(logged).toHaveBeenCalledWith(
      'update-games failed',
      expect.any(Error),
    );
    logged.mockRestore();
  });

  it('still awaits a job that succeeds', async () => {
    const run = mock(async () => 'done');
    await guard('clean-up', run);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
