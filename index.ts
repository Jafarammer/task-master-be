import app from "./app";
import { connectDB } from "./config";
import { PORT } from "./src/utils/env";

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
