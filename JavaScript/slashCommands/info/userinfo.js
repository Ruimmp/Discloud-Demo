/**
 * Este comando é igual ao comando com prefixo, mas usa o objeto de interação para responder ao usuário.
 * Os argumentos são obtidos usando o objeto interaction.options para pegar as opções fornecidas.
 */

const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class UserInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "user";
        this.description = "Comando para exibir informações sobre o usuário.";
        this.guildOnly = true;
        this.permissions = null;
        this.cooldown = 5;

        this.options = [
            {
                name: "info",
                type: ApplicationCommandOptionType.Subcommand,
                description: "Exibe informações sobre a conta de um usuário.",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionType.User,
                        description: "Usuário para exibir informações.",
                        required: false
                    }
                ]
            }
        ];
    }

    async execute(interaction) {
        // Busca o usuário pelo ID fornecido ou o usuário atual se nenhum ID for fornecido
        // interaction.options.getUser("user") retorna o ID do usuário, se fornecido, ou nulo
        const user = await (await (interaction.options.getUser("user") || interaction.user)).fetch();

        if (!user) {
            return interaction.reply("O usuário com o ID fornecido não foi encontrado.");
        }

        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(":bust_in_silhouette: Informações do Usuário")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setImage(user.bannerURL({ dynamic: true, size: 4096 }))
            .setColor(member.displayColor)
            .addFields(
                { name: "Tag", value: user.tag, inline: true },
                { name: "ID", value: `\`${user.id}\``, inline: true },
                { name: "Entrou em", value: member.joinedAt.toLocaleString(), inline: true },
                { name: "Criou a conta em", value: user.createdAt.toLocaleString(), inline: true },
                { name: "Cargos", value: member.roles.cache.filter(role => role.name !== "@everyone").map(role => role.name).join(", ") || "Nenhum", inline: true },
                { name: "Permissões", value: member.permissions.toArray().join(", "), inline: true }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Avatar do Usuário")
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            )

        if (user.banner) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel("Banner do Usuário")
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
            );
        }

        interaction.reply({ embeds: [embed], components: [row] });
    }
}