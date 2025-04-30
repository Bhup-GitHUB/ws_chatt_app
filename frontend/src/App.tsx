import { useEffect, useRef, useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Connect to the same port used in Postman (8080)
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomID: "red" },
        })
      );
    };

    ws.onmessage = (event) => {
      console.log("Received message:", event.data);
      try {
        // Parse the incoming data
        const data = JSON.parse(event.data);

        // Check if this is a chat message with the exact format shown in Postman
        if (data.type === "chat" && data.payload && data.payload.message) {
          const messageText = data.payload.message;

          // Add the message to our UI
          const newMessage = {
            id: Date.now() + Math.random(),
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            // If it's a message from the server, assume it's from someone else
            isMine: false,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setIsConnected(false);
    };

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    const message = inputRef.current?.value.trim();
    if (
      !message ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;

    // Add to UI immediately with "isMine: true"
    const newMessage = {
      id: Date.now() + Math.random(),
      text: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMine: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send to server using exact format shown in Postman
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message },
      })
    );

    // Clear input
    inputRef.current.value = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Simple header */}
      <div className="bg-violet-600 text-white p-3 shadow flex items-center space-x-2">
        <h1 className="text-lg font-medium">Chat Room</h1>
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        ></div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-3 ${
              message.isMine ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-3 py-2 ${
                message.isMine
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none shadow"
              }`}
            >
              <p className="break-words text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isMine ? "text-violet-200" : "text-gray-500"
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-3 py-2 focus:outline-none"
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            className="bg-violet-600 text-white px-4 py-2 text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
