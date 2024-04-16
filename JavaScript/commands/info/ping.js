// Import necessary components from discord.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Define PingCommand class that will handle the ping command
module.exports = class PingCommand {
    constructor(client) {
        this.client = client; // Client instance of the Discord bot
        this.name = "ping"; // Command name
        this.aliases = ["pong"]; // Alternative names for the command
        this.description = "Command to check the bot's latency."; // Description of the command
        this.usage = ""; // How to use the command (empty if not applicable)
        this.guildOnly = false; // Whether the command is limited to guild use
        this.permissions = null; // Permissions required to use the command (null means no special permissions required)
        this.args = false; // Whether the command requires additional arguments
        this.cooldown = 5; // Cooldown time in seconds to prevent spamming
    }

    // Method to execute the command, responding to the user's message
    async execute(message) {
        const apiPing = this.client.ws.ping; // Fetch the WebSocket ping to Discord's servers
        const messagePing = Date.now() - message.createdTimestamp; // Calculate the latency from the message timestamp

        // Create an embed message to display latency information
        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!") // Set the title of the embed
            .setDescription(`API Latency: \`${apiPing}ms\`\nBot Latency: \`${messagePing}ms\``) // Set the description showing both API and message latency
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red"); // Change color based on response time

        // Create an action row with a button allowing the user to ping again
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ping") // Custom ID to handle button clicks
                    .setLabel("Ping again") // Text on the button
                    .setStyle(ButtonStyle.Primary) // Style of the button (colored)
            );

        // Send the embed and button as a response to the user's command
        message.channel.send({ embeds: [embed], components: [row] });
    }
}