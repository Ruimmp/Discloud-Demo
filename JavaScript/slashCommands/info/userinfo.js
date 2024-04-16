/**
 * This command is the same as the prefix one, but it uses the interaction object to reply to the user.
 * The arguments are fetched using the interaction.options object to get the provided options.
 */

const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class UserInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "user";
        this.description = "Shows information about the user.";
        this.guildOnly = true;
        this.permissions = null;
        this.cooldown = 5;

        this.options = [
            {
                name: "info",
                type: ApplicationCommandOptionType.Subcommand,
                description: "Shows information about the user.",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionType.User,
                        description: "The user ID",
                        required: false
                    }
                ]
            }
        ];
    }

    async execute(interaction) {
        // Fetch the user from the provided ID or the current user if no ID is provided
        // interaction.options.getUser("user") returns the user ID if provided, otherwise null
        const user = await (await (interaction.options.getUser("user") || interaction.user)).fetch();

        if (!user) {
            return interaction.reply("The user with the provided ID was not found.");
        }

        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(":bust_in_silhouette: User Info")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setImage(user.bannerURL({ dynamic: true, size: 4096 }))
            .setColor(member.displayColor)
            .addFields({
                name: "Tag",
                value: user.tag,
                inline: true
            }, {
                name: "ID",
                value: `\`${user.id}\``,
                inline: true
            }, {
                name: "Joined At",
                value: member.joinedAt.toLocaleString(),
                inline: true
            }, {
                name: "Created At",
                value: user.createdAt.toLocaleString(),
                inline: true
            }, {
                name: "Roles",
                value: member.roles.cache.filter(role => role.name !== "@everyone").map(role => role.name).join(", ") || "None",
                inline: true
            }, {
                name: "Permissions",
                value: member.permissions.toArray().join(", "),
                inline: true
            });

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

        interaction.reply({ embeds: [embed], components: [row] });
    }
}