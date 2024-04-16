/**
 * This command is the same as the prefix one, but it uses the interaction object to reply to the user.
 * The arguments are fetched using the interaction.options object to get the provided options.
 */

const { ApplicationCommandOptionType, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class ServerInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "server";
        this.description = "Shows information about the server.";
        this.guildOnly = true;
        this.permissions = null;
        this.cooldown = 5;

        this.options = [
            {
                name: "info",
                type: ApplicationCommandOptionType.Subcommand,
                description: "Shows information about the server.",
                options: [
                    {
                        name: "server",
                        type: ApplicationCommandOptionType.String,
                        description: "The server ID",
                        required: false
                    }
                ]
            }
        ];
    }

    async execute(interaction) {
        // Fetch the guild from the provided ID or the current guild if no ID is provided
        // interaction.options.getString("server") returns the server ID if provided, otherwise null
        const guild = interaction.options.getString("server") ? this.client.guilds.cache.get(interaction.options.getString("server")) : interaction.guild;

        if (!guild) {
            return interaction.reply({ content: "The server with the provided ID was not found." });
        }

        const owner = await this.client.users.fetch(guild.ownerId).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(":shield: Guild Info")
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "Name", value: guild.name, inline: true },
                { name: "ID", value: `\`${guild.id}\``, inline: true },
                { name: "Owner", value: owner ? owner.tag : "Unknown", inline: true },
                { name: "Created At", value: guild.createdAt.toLocaleString(), inline: true },
                { name: "Members Count", value: guild.memberCount.toString(), inline: true },
                { name: "Text Channels Count", value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
                { name: "Voice Channels Count", value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
                { name: "Roles Count", value: guild.roles.cache.size.toString(), inline: true },
                { name: "Emojis Count", value: guild.emojis.cache.size.toString(), inline: true })
            .setColor("Random");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Server Icon")
                    .setStyle(ButtonStyle.Link)
                    .setURL(guild.iconURL({ dynamic: true }))
            );

        interaction.reply({ embeds: [embed], components: [row] });
    }
}