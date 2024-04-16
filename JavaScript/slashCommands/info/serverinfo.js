/**
 * Este comando é o mesmo que o comando com prefixo, mas usa o objeto de interação para responder ao usuário.
 * Os argumentos são obtidos usando o objeto interaction.options para pegar as opções fornecidas.
 */

const { ApplicationCommandOptionType, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class ServerInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "server";
        this.description = "Comando para mostrar informações sobre o servidor.";
        this.guildOnly = true;
        this.permissions = null;
        this.cooldown = 5;

        this.options = [
            {
                name: "info",
                type: ApplicationCommandOptionType.Subcommand,
                description: "Mostra informações sobre o servidor.",
                options: [
                    {
                        name: "server",
                        type: ApplicationCommandOptionType.String,
                        description: "Servidor para exibir informações.",
                        required: false
                    }
                ]
            }
        ];
    }

    async execute(interaction) {
        // Busca o servidor pelo ID fornecido ou a guilda atual se nenhum ID for fornecido
        // interaction.options.getString("server") retorna o ID do servidor, se fornecido, ou nulo
        const guild = interaction.options.getString("server") ? this.client.guilds.cache.get(interaction.options.getString("server")) : interaction.guild;

        if (!guild) {
            return interaction.reply({ content: "O servidor com o ID fornecido não foi encontrado." });
        }

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
            .setColor("Random");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Ícone do Servidor")
                    .setStyle(ButtonStyle.Link)
                    .setURL(guild.iconURL({ dynamic: true }))
            );

        interaction.reply({ embeds: [embed], components: [row] });
    }
}