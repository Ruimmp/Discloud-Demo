const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class UserInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "userinfo";
        this.aliases = ["user", "memberinfo", "member"];
        this.description = "Shows information about the user.";
        this.usage = "[user id]";
        this.guildOnly = true;
        this.permissions = null;
        this.args = false;
        this.cooldown = 5;
    }

    // Method to execute the command, responding to the user's message
    // "args" is an array of arguments provided by the user
    async execute(message, args) {
        // Fetch the user, defaulting to the message author if no ID is provided
        const user = await (await (args.length ? this.client.users.fetch(args[0]).catch(() => null) : message.author.fetch())).fetch();

        // Handle if user not found
        if (!user) {
            return message.reply("The user with the provided ID was not found.");
        }

        // Fetch member details from the guild
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(":bust_in_silhouette: User Info")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setImage(user.bannerURL({ dynamic: true, size: 4096 }))
            .setColor(member.displayColor) // Set the color to the member's display color
            .addFields(
                { name: "Tag", value: user.tag, inline: true },
                { name: "ID", value: `\`${user.id}\``, inline: true },
                { name: "Joined At", value: member.joinedAt.toLocaleString(), inline: true },
                { name: "Created At", value: user.createdAt.toLocaleString(), inline: true },
                { name: "Roles", value: member.roles.cache.filter(role => role.name !== "@everyone").map(role => role.name).join(", ") || "None", inline: true },
                { name: "Permissions", value: member.permissions.toArray().join(", "), inline: true }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("User Avatar")
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            )

        if (user.banner) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel("User Banner")
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
            );
        }

        message.channel.send({ embeds: [embed], components: [row] });
    }
}