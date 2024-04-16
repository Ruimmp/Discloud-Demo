const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class ServerInfoCommand {
    constructor(client) {
        this.client = client;
        this.name = "serverinfo";
        this.aliases = ["server", "guildinfo", "guild"];
        this.description = "Shows information about the server.";
        this.usage = "[server id]";
        this.guildOnly = true;
        this.permissions = null;
        this.args = false;
        this.cooldown = 5;
    }

    // Method to execute the command, responding to the user's message
    // "args" is an array of arguments provided by the user
    async execute(message, args) {
        // Fetch guild by ID from args or default to message guild
        const guild = args.length ? this.client.guilds.cache.get(args[0]) : message.guild;

        // Handle if guild not found
        if (!guild) {
            return message.reply("The server with the provided ID was not found.");
        }

        // Fetch guild owner details
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
                { name: "Emojis Count", value: guild.emojis.cache.size.toString(), inline: true }
            )
            .setColor("Random"); // Set a random color for the embed

        // Create a button to access the server icon
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Server Icon")
                    .setStyle(ButtonStyle.Link)
                    .setURL(guild.iconURL({ dynamic: true }))
            );

        message.channel.send({ embeds: [embed], components: [row] });
    }
}