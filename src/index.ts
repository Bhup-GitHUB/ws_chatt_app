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
    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomID,
      });
    }

    if(parsedMessage.type === "chat"){
      allSockets.forEach((user) => {
        if(user.room === parsedMessage.payload.roomID){
          user.socket.send(JSON.stringify(parsedMessage));
        }
      });
    }
  });
});
