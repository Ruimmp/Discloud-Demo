/**
 * Este comando ping é o mesmo que o comando com prefixo, mas usa o objeto de interação para responder ao usuário.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class PingCommand {
    constructor(client) {
        this.client = client;
        this.name = "ping";
        this.description = "Comando para verificar a latência do bot.";
        this.guildOnly = false;
        this.permissions = null;
        this.cooldown = 5;
    }

    async execute(interaction) {
        const apiPing = this.client.ws.ping;
        const interactionPing = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!")
            .setDescription(`Latência da API: \`${apiPing}ms\`\nLatência do Bot: \`${interactionPing}ms\``)
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ping")
                    .setLabel("Pingar novamente")
                    .setStyle(ButtonStyle.Primary)
            );

        interaction.reply({ embeds: [embed], components: [row] });
    }
}