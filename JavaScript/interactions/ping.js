const { EmbedBuilder } = require("discord.js");

module.exports = class PingButton {
    constructor(client) {
        this.client = client; // Discord bot client instance
        this.id = "ping"; // Identifier for this button interaction handler
    }

    // Method to execute when the ping button is pressed
    async execute(interaction) {
        // Acknowledge the interaction first but wait to send a response later
        // This is to prevent the interaction from expiring before the bot sends a response (within 3 seconds)
        await interaction.deferUpdate();

        const apiPing = this.client.ws.ping;
        const interactionPing = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!")
            .setDescription(`API Latency: \`${apiPing}ms\`\nBot Latency: \`${interactionPing}ms\` (Button)`)
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red");
        interaction.message.edit({ embeds: [embed] });
    }
};