// Importa componentes necessários da biblioteca discord.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Define a classe PingCommand que vai tratar o comando ping
module.exports = class PingCommand {
    constructor(client) {
        this.client = client; // Instância do cliente do bot do Discord
        this.name = "ping"; // Nome do comando
        this.aliases = ["pong"]; // Nomes alternativos para usar o comando
        this.description = "Comando para verificar a latência do bot."; // Descrição do comando
        this.usage = ""; // Como usar o comando (vazio se não aplicável)
        this.guildOnly = false; // Se o comando é limitado ao uso em servidores
        this.permissions = null; // Permissões necessárias para usar o comando (null significa que não são necessárias permissões especiais)
        this.args = false; // Se o comando requer argumentos adicionais
        this.cooldown = 5; // Tempo de cooldown em segundos para evitar spam
    }

    // Método para executar o comando, respondendo à mensagem do usuário
    async execute(message) {
        const apiPing = this.client.ws.ping; // Busca o ping do WebSocket da API do Discord
        const messagePing = Date.now() - message.createdTimestamp; // Calcula a latência a partir do timestamp da mensagem

        // Cria uma mensagem embed para exibir informações da latência
        const embed = new EmbedBuilder()
            .setTitle(":ping_pong: Pong!") // Define o título da embed
            .setDescription(`Latência da API: \`${apiPing}ms\`\nLatência do Bot: \`${messagePing}ms\``) // Define a descrição mostrando a latência da API e do bot
            .setColor(apiPing < 200 ? "Green" : apiPing < 400 ? "Yellow" : "Red"); // Altera a cor baseada no tempo de resposta

        // Cria um botão para permitir ao usuário pingar novamente sem enviar uma nova mensagem
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ping") // ID personalizado para tratar cliques no botão
                    .setLabel("Pingar novamente") // Texto no botão
                    .setStyle(ButtonStyle.Primary) // Estilo do botão (colorido)
            );

        // Envia o embed e o botão como resposta ao comando do usuário
        message.channel.send({ embeds: [embed], components: [row] });
    }
}