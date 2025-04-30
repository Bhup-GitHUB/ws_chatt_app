import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: String;
}

let userCount = 0;
let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    //{room: String, message: String}
  });
});
