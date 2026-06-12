import web from "./app/web";
import { connectDB } from "./app/database";
import { verifySMTP } from "./mail/mail";
import { PORT } from "./utils/env";
import { logger } from "./app/logging";

async function start() {
  await connectDB();
  await verifySMTP();
  web.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

start();
