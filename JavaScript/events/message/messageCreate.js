const { Events, ChannelType, Collection } = require("discord.js");
const { prefix } = require("../../config.json");  // Import the prefix from the configuration file

module.exports = class MessageCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = Events.MessageCreate;
    }

    run(message) {
        if (message.author.bot) return;  // Ignore messages sent by bots
        if (!message.content.startsWith(prefix)) return;  // Ignore any messages that don't start with the defined prefix

        // Parse the message into a command name and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();  // Extract the command name and make it lowercase

        // Fetch the command from the client's command collection or its aliases
        const command = this.client.commands.get(commandName) || this.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;  // If the command is not found, do nothing

        // Check if the command is intended to be executed only in guilds
        if (command.guildOnly && message.channel.type === ChannelType.DM) {
            return message.reply("I can\'t execute that command inside DMs!");
        }

        // Check if the executing user has the necessary permissions to use the command
        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return message.reply("You don\'t have the necessary permissions to execute this command!");
            }
        }

        // Check if the command requires arguments and if they are provided
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);  // Send the usage information
        }

        // Handle command cooldowns using a Collection stored in the client
        // If the command doesn't have a cooldown, set it to 3 seconds by default to prevent spam abuse
        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            // Check if the user is still in the cooldown period and inform them about the remaining time
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft.toFixed(0)} more second${timeLeft > 1 ? "s" : ""} before reusing the \`${command.name}\` command.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);  // Remove the timestamp after the cooldown period

        try {
            command.execute(message, args);  // Execute the command with the provided arguments
        } catch (error) {
            console.error(error);  // Log any errors to the console
            message.reply("There was an error trying to execute that command!");  // Inform the user about the error
        }
    }
};