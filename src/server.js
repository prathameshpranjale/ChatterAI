// Import necessary modules
import http from "http"; // HTTP module to create the server
import app from "./app.js"; // Import the Express app (Assumed to be defined in app.js)
import db from "./db/db.js"; // Database connection setup (Assumed to be defined in db.js)
import { Server } from "socket.io"; // Import the Socket.IO server class

const PORT = process.env.PORT || 3000; // Define the port number (uses the environment variable PORT or defaults to 3000)

// Async function to start the server
async function startServer() {
    try {
        // Step 1: Connect to the database
        await db.dbConnect(); // Calling the dbConnect function from the db module to establish a connection to the database
        console.log("Database connected successfully."); // Log success message after successful database connection

        // Step 2: Create an HTTP server using Express
        const server = http.createServer(app); // Create an HTTP server that uses the Express app (app.js)

        // Step 3: Create a new Socket.IO server and attach it to the HTTP server
        const io = new Server(server, {
            cors: {
                origin: "*", // Allow requests from any origin (cross-origin requests)
            },
            // pingInterval: 30000,  // Optional: Send a ping every 30 seconds to keep the connection alive
            // pingTimeout: 60000    // Optional: Disconnect if no response from the client within 60 seconds
        });

        // Step 4: Initialize a Map to track connected users
        const userSockets = new Map(); // This will hold userId as the key and socket.id as the value to track which socket each user is associated with

        // Step 5: Handle incoming client connections
        io.on("connection", (socket) => { // "connection" event is fired whenever a new client connects
            console.log("New user connected:", socket.id); // Log the socket ID of the newly connected user

            // Step 6: Register the user with their userId and socket ID
            socket.on("register", (userId) => { // Listen for "register" event where the client sends their userId
                if (userId) {
                    userSockets.set(userId, socket.id); // Map the userId to the socket.id to track the user's connection
                    console.log(`User ${userId} registered with socket ID: ${socket.id}`); // Log the registration of the user
                } else {
                    console.error("register event received without userId."); // Log an error if no userId was provided
                }
            });

            // Step 7: Handle sending a message from one user to another
            socket.on("sendMessage", async ({ senderId, receiverId, message }) => { // Listen for "sendMessage" event with senderId, receiverId, and the message
                try {
                    console.log(`Message received from ${senderId} to ${receiverId}: "${message}"`); // Log the received message details

                    // Validate that required fields are present
                    if (!senderId || !receiverId || !message) {
                        throw new Error("Missing required fields in sendMessage event."); // Throw an error if any required field is missing
                    }

                    // Step 8: Save the message to the database
                    await db.query(
                        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)",
                        [senderId, receiverId, message]
                    ); // Save the message in the database (assuming SQL database here)

                    // Step 9: Get the socket ID of the receiver
                    const receiverSocketId = userSockets.get(receiverId); // Retrieve the receiver's socket ID from the userSockets map
                    if (receiverSocketId) {
                        // If the receiver is connected, emit the message to them
                        io.to(receiverSocketId).emit("receiveMessage", { senderId, message }); // Send the message to the receiver
                        console.log(`Message delivered to ${receiverId}`); // Log the delivery of the message
                    } else {
                        console.log(`Receiver ${receiverId} is not connected.`); // Log if the receiver is not currently connected
                    }
                } catch (error) {
                    console.error("Error in sendMessage:", error); // Log any errors that occur during the message sending process
                    socket.emit("errorMessage", "Failed to send message. Please try again."); // Emit an error message back to the sender
                }
            });

            // Step 10: Handle user disconnection
            socket.on("disconnect", () => { // Listen for the "disconnect" event when a user disconnects
                console.log("User disconnected:", socket.id); // Log when a user disconnects

                // Step 11: Remove the user from the userSockets map
                for (const [userId, socketId] of userSockets.entries()) {
                    if (socketId === socket.id) {
                        userSockets.delete(userId); // Delete the user from the map based on their socketId
                        console.log(`User ${userId} removed from userSockets.`); // Log that the user was removed
                        break;
                    }
                }
            });
        });

        // Step 12: Start the HTTP server and listen on the defined port
        server.listen(PORT, () => {
            console.log(`Server is listening on PORT ${PORT}`); // Log that the server is up and running
        });

    } catch (error) {
        console.error("Error starting the server:", error); // Catch any errors during the server setup and log them
    }
}

// Call the startServer function to initiate the server
startServer();
