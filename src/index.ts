import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { app } from "./app.js";
import http from "http";
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
