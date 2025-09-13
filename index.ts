import app from "./app";
import { connectDB } from "./config";

const PORT = process.env.PORT;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
