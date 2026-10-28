import { SummaryService } from "./summary.service";

// const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function startDailySummaryScheduler() {
  const service = new SummaryService();

  const saveSummaries = async (date: string) => {
    try {
      const savedCount =
        await service.saveDailySummariesForAllOrganisations(date);
      console.info(`[daily-summary] Saved ${savedCount} summaries for ${date}`);
    } catch (error) {
      console.error(
        `[daily-summary] Failed to save summaries for ${date}`,
        error,
      );
    }
  };

  const scheduleNextRun = () => {
    const now = new Date();
    const nextRunAt = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
    );

    setTimeout(
      async () => {
        const date = new Date(nextRunAt - 1).toISOString().slice(0, 10);
        await saveSummaries(date);
        scheduleNextRun();
      },
      Math.max(0, nextRunAt - Date.now()),
    );
  };

  // const yesterday = new Date(Date.now() - DAY_IN_MILLISECONDS)
  //   .toISOString()
  //   .slice(0, 10);

  // Recover the most recently completed day if the server was offline at midnight.
  // void saveSummaries(yesterday);
  scheduleNextRun();
}
