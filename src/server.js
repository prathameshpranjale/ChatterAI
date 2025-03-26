import http from "http";
import app from "./app.js";
import db from "./db/db.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.dbConnect();
        console.log("Database connected successfully.");

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: { origin: "*" },
        });

        const userSockets = new Map(); // userId -> socketId
        const activeUsers = new Map(); // userId -> { username, socketId }

        io.on("connection", (socket) => {
            console.log("New user connected:", socket.id);

            // User joins and registers
            socket.on("register", ({ userId, username }) => {
                if (userId && username) {
                    userSockets.set(userId, socket.id);
                    activeUsers.set(userId, { username, socketId: socket.id });

                    socket.join("Lobby"); // Join general chat
                    io.to("Lobby").emit("userJoined", `${username} has joined the chat.`);

                    // Send updated user list to all clients
                    io.emit("updateUserList", Array.from(activeUsers.values()));

                    console.log(`User ${username} (ID: ${userId}) registered.`);
                }
            });

            // Handle sending messages in Lobby
            socket.on("sendMessage", ({ senderId, message }) => {
                if (!senderId || !message) return;

                const senderName = activeUsers.get(senderId)?.username || "Unknown";

                // Broadcast the message to everyone in the Lobby except the sender
                socket.broadcast.to("Lobby").emit("receiveMessage", { senderId, senderName, message });

                // Send the message back to the sender as "You"
                socket.emit("receiveMessage", { senderId, senderName: "You", message });

                console.log(`Message from ${senderName}: ${message}`);
            });

            // Notify everyone in the lobby when a new user joins
            socket.on("joinLobby", ({ userId }) => {
                const username = activeUsers.get(userId)?.username || "Unknown";
                io.to("Lobby").emit("userJoined", `${username} has joined the lobby.`);
                console.log(`${username} joined the lobby.`);
            });

            // Handle private messaging
            socket.on("startPrivateChat", ({ senderId, receiverId }) => {
                if (!senderId || !receiverId) return;

                const senderName = activeUsers.get(senderId)?.username;
                const receiverSocketId = userSockets.get(receiverId);

                if (receiverSocketId) {
                    const roomName = `private_${senderId}_${receiverId}`;
                    socket.join(roomName);
                    io.to(receiverSocketId).emit("privateChatRequest", { roomName, senderName });

                    console.log(`Private chat started between ${senderId} and ${receiverId}`);
                }
            });

            socket.on("sendPrivateMessage", ({ roomName, senderId, message }) => {
                if (!roomName || !senderId || !message) return;

                const senderName = activeUsers.get(senderId)?.username;
                io.to(roomName).emit("receivePrivateMessage", { senderId, senderName, message });
            });

            // Handle user disconnection
            socket.on("disconnect", () => {
                for (const [userId, data] of activeUsers.entries()) {
                    if (data.socketId === socket.id) {
                        activeUsers.delete(userId);
                        userSockets.delete(userId);
                        io.emit("updateUserList", Array.from(activeUsers.values()));
                        io.to("Lobby").emit("userLeft", `${data.username} has left the chat.`);
                        console.log(`User ${data.username} disconnected.`);
                        break;
                    }
                }
            });
        });

        server.listen(PORT, () => {
            console.log(`Server is listening on PORT ${PORT}`);
        });

    } catch (error) {
        console.error("Error starting the server:", error);
    }
}

startServer();
