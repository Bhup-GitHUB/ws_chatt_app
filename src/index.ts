import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;
let allSockets: WebSocket[] = [];

wss.on("connection", (socket) => {
  userCount++;
  console.log(`User connected. Total users: ${userCount}`);

  // Add the new socket to the array
  allSockets.push(socket);

  socket.on("message", (event) => {
    console.log(`Received message: ${event}`);
    allSockets.forEach((s) => {
      if (s !== socket && s.readyState === WebSocket.OPEN) {
        s.send(`User ${userCount} says: ${event}`);
      }
    });
  });

  socket.on("close", () => {
    userCount--;
    console.log(`User disconnected. Total users: ${userCount}`);
    // Remove the socket from the array when it disconnects
    allSockets = allSockets.filter((s) => s !== socket);
  });
});
