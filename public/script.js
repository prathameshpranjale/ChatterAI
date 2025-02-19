const socket = io();

// Register user
const userId = prompt("Enter your user ID:");
socket.emit("register", userId);

// Welcome message from server
socket.on("welcome", (message) => {
    displayMessage("Server", message);
});

// Receiving messages
socket.on("receiveMessage", (data) => {
    displayMessage(data.senderId, data.message);
});

// Sending messages
document.getElementById("sendMessage").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    const receiverId = prompt("Enter receiver ID:"); // Ask user for receiver ID

    if (message.trim() !== "" && receiverId.trim() !== "") {
        socket.emit("sendMessage", { senderId: userId, receiverId, message });
        displayMessage("You", message);
        messageInput.value = "";
    }
});

// Display messages in chat window
function displayMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${sender}: ${message}`;
    document.getElementById("messages").appendChild(messageDiv);
}
