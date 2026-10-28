import app from "./app.js";
import { startDailySummaryScheduler } from "./modules/summary/summary.scheduler";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FlowStation server running at: http://localhost:${PORT}`);
  startDailySummaryScheduler();
});
