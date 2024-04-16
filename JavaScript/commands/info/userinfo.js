const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class UserInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "userinfo";
        this.aliases = ["user", "memberinfo", "member"];
        this.description = "Mostra informações sobre o usuário.";
        this.usage = "[ID do usuário]";
        this.guildOnly = true;
        this.permissions = null;
        this.args = false;
        this.cooldown = 5;
    }

    // Método para executar o comando, respondendo à mensagem do usuário
    // "args" é uma matriz de argumentos fornecidos pelo usuário
    async execute(message, args) {
        // Busca o usuário, usando o autor da mensagem como padrão se nenhum ID for fornecido
        const user = await (await (args.length ? this.client.users.fetch(args[0]).catch(() => null) : message.author.fetch())).fetch();

        // Trata o caso de o usuário não ser encontrado
        if (!user) {
            return message.reply("O usuário com o ID fornecido não foi encontrado.");
        }

        // Busca detalhes do membro no servidor
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(":bust_in_silhouette: Informações do Usuário")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setImage(user.bannerURL({ dynamic: true, size: 4096 }))
            .setColor(member.displayColor) // Define a cor do embed baseada na cor da borda do membro (perfil do usuário)
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

        message.channel.send({ embeds: [embed], components: [row] });
    }
}