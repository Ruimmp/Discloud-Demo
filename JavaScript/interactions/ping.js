const { EmbedBuilder } = require("discord.js");

module.exports = class PingButton {
    constructor(client) {
        this.client = client; // Instância do cliente do bot do Discord
        this.id = "ping"; // Identificador para este manipulador de interação de botão
    }

    // Método para executar quando o botão ping for pressionado
    async execute(interaction) {
        // Reconhece a interação primeiro, mas espera para enviar uma resposta mais tarde
        // Isso é para prevenir que a interação expire antes do bot enviar uma resposta (dentro de 3 segundos)
        await interaction.deferUpdate();

        const apiPing = this.client.ws.ping;
        const interactionPing = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!")
            .setDescription(`Latência da API: \`${apiPing}ms\`\nLatência do Bot: \`${interactionPing}ms\` (Botão)`)
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red");
        interaction.message.edit({ embeds: [embed] });
    }
};