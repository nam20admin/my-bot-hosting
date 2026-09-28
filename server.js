const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Lưu trữ các Bot đang chạy ngầm 24/7
const activeBots = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API nhận Token và giữ Bot Online ngầm 24/7
app.post('/api/start-bot', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập Token!' });
    }

    if (activeBots.has(token)) {
        return res.json({ success: true, message: 'Bot này đã và đang chạy ngầm 24/7 rồi!' });
    }

    try {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        client.once('ready', () => {
            console.log(`[ONLINE 24/7] Bot ${client.user.tag} đã hoạt động ngầm!`);
        });

        client.on('messageCreate', (message) => {
            if (message.author.bot) return;
            if (message.content.toLowerCase() === 'ping') {
                message.reply('Pong! Bot đang chạy 24/7 từ Server!');
            }
        });

        await client.login(token);
        activeBots.set(token, client);

        return res.json({ 
            success: true, 
            message: `Thành công! Bot ${client.user.tag} đã được treo 24/7 trên Server!` 
        });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Token không đúng hoặc chưa bật Intent trên Discord Developer Portal!' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server Web Hosting đang chạy tại cổng: ${PORT}`);
});