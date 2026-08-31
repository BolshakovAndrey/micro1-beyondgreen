import { readFile } from "node:fs/promises";
import net from "node:net";

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
const request = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { deniedPath: string };

let fileDenied = false;
try {
  await readFile(request.deniedPath, "utf8");
} catch (error) {
  fileDenied = error instanceof Error && "code" in error
    && (error.code === "EPERM" || error.code === "EACCES" || error.code === "ERR_ACCESS_DENIED");
}

const networkDenied = await new Promise<boolean>((resolve) => {
  const socket = net.connect({ host: "127.0.0.1", port: 9 });
  const timer = setTimeout(() => { socket.destroy(); resolve(false); }, 1_000);
  socket.on("connect", () => { clearTimeout(timer); socket.destroy(); resolve(false); });
  socket.on("error", (error: NodeJS.ErrnoException) => {
    clearTimeout(timer);
    resolve(error.code === "EPERM" || error.code === "EACCES");
  });
});

process.stdout.write(`${JSON.stringify({ fileDenied, networkDenied })}\n`);
