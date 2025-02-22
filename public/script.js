const socket = io(); // Initialize Socket.IO connection

// Prompt user to enter their user ID upon joining
const userId = prompt("Enter your user ID:");

// Emit a 'register' event to notify the server that a new user has joined
socket.emit("register", userId);

// Notify all users that someone has joined
socket.on("userJoined", (message) => {
    displayMessage("Server", message);
});

// Listen for welcome message from server
socket.on("welcome", (message) => {
    displayMessage("Server", message);
});

// Listen for incoming messages
socket.on("receiveMessage", (data) => {
    displayMessage(data.senderId, data.message);
});

// Handle sending messages
document.getElementById("sendMessage").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const receiverIdInput = document.getElementById("receiverIdInput");
    const message = messageInput.value;
    const receiverId = receiverIdInput.value; // Get receiver ID from input field

    // Ensure message and receiver ID are not empty
    if (message.trim() !== "" && receiverId.trim() !== "") {
        // Emit the 'sendMessage' event with senderId, receiverId, and message
        socket.emit("sendMessage", { senderId: userId, receiverId, message });

        // Display message in sender's chat window
        displayMessage("You", message);

        // Clear input field after sending message
        messageInput.value = "";
    }
});

// Function to display messages in chat window
function displayMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${sender}: ${message}`;
    document.getElementById("messages").appendChild(messageDiv);
}
