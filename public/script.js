const socket = io();

const username = prompt("Enter your username:");
const userId = Math.random().toString(36).substr(2, 9); 
socket.emit("register", { userId, username });

socket.on("updateUserList", (users) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; // Clear list

    users.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.textContent = user.username;
        userItem.classList.add("user");
        userList.appendChild(userItem);
    });
});

// Display messages in Lobby
socket.on("receiveMessage", ({ senderId, senderName, message }) => {
    // Check if the message is from the current user
    const displayName = senderId === userId ? "You" : senderName;
    displayMessage(`${displayName}: ${message}`, "Lobby");
});

// Notify when a user joins the lobby
socket.on("userJoined", (message) => {
    displayMessage(message, "Lobby");
});

// Notify when a user leaves the lobby
socket.on("userLeft", (message) => {
    displayMessage(message, "Lobby");
});

// Send a message to the lobby
document.getElementById("sendMessage").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("sendMessage", { senderId: userId, message });
        messageInput.value = ""; // Clear the input field
    }
});

// Handle private chat initiation
function startPrivateChat(receiverId, receiverName) {
    const chatWindow = openChatWindow(receiverName);
    socket.emit("startPrivateChat", { senderId: userId, receiverId });

    socket.on("privateChatRequest", ({ roomName }) => {
        chatWindow.setRoom(roomName);
    });

    socket.on("receivePrivateMessage", ({ senderName, message }) => {
        chatWindow.displayMessage(`${senderName}: ${message}`);
    });
}

// Function to open a private chat window
function openChatWindow(username) {
    const chatBox = document.createElement("div");
    chatBox.classList.add("chat-box");

    const chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header");
    chatHeader.textContent = username;
    chatBox.appendChild(chatHeader);

    const chatMessages = document.createElement("div");
    chatMessages.classList.add("chat-messages");
    chatBox.appendChild(chatMessages);

    const chatInput = document.createElement("input");
    chatInput.setAttribute("placeholder", "Type your message...");
    chatBox.appendChild(chatInput);

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    chatBox.appendChild(sendButton);

    sendButton.addEventListener("click", () => {
        const message = chatInput.value;
        if (message.trim() !== "") {
            socket.emit("sendPrivateMessage", { roomName: chatBox.roomName, senderId: userId, message });
            displayMessage(`You: ${message}`, chatMessages);
            chatInput.value = "";
        }
    });

    document.body.appendChild(chatBox);

    return {
        setRoom: (room) => (chatBox.roomName = room),
        displayMessage: (msg) => {
            const msgDiv = document.createElement("div");
            msgDiv.textContent = msg;
            chatMessages.appendChild(msgDiv);
        }
    };
}

// Display messages in chat window
function displayMessage(message, target = "Lobby") {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    document.getElementById(target === "Lobby" ? "messages" : target).appendChild(messageDiv);
}
