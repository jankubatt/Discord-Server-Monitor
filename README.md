# Discord Server Monitor
## Description
This software watches your discord server for user activity. Visualize each persons statuses and their time spent on discord.

![dashboard](https://github.com/jankubatt/Discord-Server-Monitor/blob/main/dashboard.webp)
![user](https://github.com/jankubatt/Discord-Server-Monitor/blob/main/user.webp)

## Prerequisites
- MySQL database
- Discord bot
- Discord server
- Web server

## Installation
1. Create a Discord bot in the Discord Developer Portal
2. Open up the bot folder and inside the index file insert your **bot token** and **server ID**
3. Create mysql database and inside it create this table:
```
CREATE TABLE presences (
    `id` int(11) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255),
    `status` VARCHAR(255),
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    `avatar` VARCHAR(255)
);
```
4. Fill out all the .env files in the frontend and backend
5. npm i frontend and backend
6. Run the backend and frontend

## FAQ
### Not working
Check if the bot works. On the first initial launch the bot creates initial records of all users states. If you have empty table, the bot isnt working properly. If you have issues open a bug report in the issues tab.

## Disclaimer
This software is for educational purposes only. Malicious use is not advised. I do not take responsibility for this software. Use at your own risk.
