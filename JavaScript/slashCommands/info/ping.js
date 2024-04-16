/**
 * This ping command is the same as the prefix one, but it uses the interaction object to reply to the user.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class PingCommand {
    constructor(client) {
        this.client = client;
        this.name = "ping";
        this.description = "Command to check the bot's latency.";
        this.guildOnly = false;
        this.permissions = null;
        this.cooldown = 5;
    }

    async execute(interaction) {
        const apiPing = this.client.ws.ping;
        const interactionPing = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!")
            .setDescription(`API Latency: \`${apiPing}ms\`\nBot Latency: \`${interactionPing}ms\``)
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ping")
                    .setLabel("Ping again")
                    .setStyle(ButtonStyle.Primary)
            );

        interaction.reply({ embeds: [embed], components: [row] });
    }
}