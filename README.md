# Web Chat App

This is a web chat application built using Node.js, Express, and Socket.IO. The application allows users to register, send messages to each other, and receive messages in real-time.

## Features

- User registration and authentication
- Real-time messaging using Socket.IO
- Database integration for storing messages
- Static file serving for the frontend

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/web-chat-app.git
    cd web-chat-app
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Set up the environment variables:

    Create a [.env](http://_vscodecontentref_/1) file in the root directory and add the following variables:

    ```env
    PORT=3000
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    ```

4. Start the server:

    ```bash
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new user or log in with an existing user.
3. Start chatting with other users in real-time.

## Project Structure
