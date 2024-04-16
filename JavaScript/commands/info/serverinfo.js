const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class ServerInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "serverinfo";
        this.aliases = ["server", "guildinfo", "guild"];
        this.description = "Comando para exibir informações sobre o servidor.";
        this.usage = "[ID do servidor]";
        this.guildOnly = true;
        this.permissions = null;
        this.args = false;
        this.cooldown = 5;
    }

    // Método para executar o comando, respondendo à mensagem do usuário
    // "args" é um array de argumentos fornecidos pelo usuário
    async execute(message, args) {
        // Busca o servidor por ID a partir dos args ou usa o servidor onde a mensagem foi enviada como padrão
        const guild = args.length ? this.client.guilds.cache.get(args[0]) : message.guild;

        // Trata o caso de o servidor não ser encontrado
        if (!guild) {
            return message.reply("O servidor com o ID fornecido não foi encontrado.");
        }

        // Busca detalhes do dono do servidor
        const owner = await this.client.users.fetch(guild.ownerId).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(":shield: Informações do Servidor")
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "Nome", value: guild.name, inline: true },
                { name: "ID", value: `\`${guild.id}\``, inline: true },
                { name: "Dono", value: owner ? owner.tag : "Unknown", inline: true },
                { name: "Criado em", value: guild.createdAt.toLocaleString(), inline: true },
                { name: "Contagem de Membros", value: guild.memberCount.toString(), inline: true },
                { name: "Contagem de Canais de Texto", value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
                { name: "Contagem de Canais de Voz", value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
                { name: "Contagem de Cargos", value: guild.roles.cache.size.toString(), inline: true },
                { name: "Contagem de Emojis", value: guild.emojis.cache.size.toString(), inline: true }
            )
            .setColor("Random"); // Define uma cor aleatória para o embed

        // Cria um botão para acessar o ícone do servidor
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ícone do Servidor")
                    .setStyle(ButtonStyle.Link)
                    .setURL(guild.iconURL({ dynamic: true }))
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }
}