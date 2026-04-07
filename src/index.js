import { createServer } from "http";
import { Server as SocketIO } from "socket.io";

const port = process.env.PORT || 80;
const corsOrigin = process.env.CORS_ORIGIN || "*";

const httpServer = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("excalibar collaboration server is up :)");
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new SocketIO(httpServer, {
  transports: ["websocket", "polling"],
  cors: {
    origin: corsOrigin,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  io.to(socket.id).emit("init-room");

  socket.on("join-room", async (roomID) => {
    await socket.join(roomID);
    const sockets = await io.in(roomID).fetchSockets();

    if (sockets.length <= 1) {
      io.to(socket.id).emit("first-in-room");
    } else {
      socket.broadcast.to(roomID).emit("new-user", socket.id);
    }

    io.in(roomID).emit(
      "room-user-change",
      sockets.map((s) => s.id),
    );
  });

  socket.on("server-broadcast", (roomID, encryptedData, iv) => {
    socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
  });

  socket.on("server-volatile-broadcast", (roomID, encryptedData, iv) => {
    socket.volatile.broadcast
      .to(roomID)
      .emit("client-broadcast", encryptedData, iv);
  });

  socket.on("user-follow", async (payload) => {
    const roomID = `follow@${payload.userToFollow.socketId}`;

    switch (payload.action) {
      case "FOLLOW": {
        await socket.join(roomID);
        const sockets = await io.in(roomID).fetchSockets();
        io.to(payload.userToFollow.socketId).emit(
          "user-follow-room-change",
          sockets.map((s) => s.id),
        );
        break;
      }
      case "UNFOLLOW": {
        await socket.leave(roomID);
        const sockets = await io.in(roomID).fetchSockets();
        io.to(payload.userToFollow.socketId).emit(
          "user-follow-room-change",
          sockets.map((s) => s.id),
        );
        break;
      }
    }
  });

  socket.on("disconnecting", async () => {
    for (const roomID of Array.from(socket.rooms)) {
      const otherClients = (await io.in(roomID).fetchSockets()).filter(
        (s) => s.id !== socket.id,
      );
      const isFollowRoom = roomID.startsWith("follow@");

      if (!isFollowRoom && otherClients.length > 0) {
        socket.broadcast.to(roomID).emit(
          "room-user-change",
          otherClients.map((s) => s.id),
        );
      }

      if (isFollowRoom && otherClients.length === 0) {
        const socketId = roomID.replace("follow@", "");
        io.to(socketId).emit("broadcast-unfollow");
      }
    }
  });

  socket.on("disconnect", () => {
    socket.removeAllListeners();
    socket.disconnect();
  });
});

httpServer.listen(port, () => {
  console.log(`excalibar listening on port ${port}`);
});
