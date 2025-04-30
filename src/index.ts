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
    //   {
    //     "type":"join",
    //     "payload":{
    //     "roomID":"123"
    //     }
    // }

    //   {
    //     "type":"chat",
    //     "payload":{
    //     "message":"hi there"
    //     }
    // }

    const parsedMessage = JSON.parse(message as unknown as string);
    console.log(parsedMessage);
    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomID,
      });
    }

    if (parsedMessage.type === "chat") {
      const sender = allSockets.find((user) => user.socket === socket);
      if (!sender) return;

      allSockets.forEach((user) => {
        if (user.room === sender.room) {
          user.socket.send(JSON.stringify(parsedMessage));
        }
      });
    }
  });
});
