const { Events, ChannelType } = require("discord.js");

// Defines the InteractionCreateEvent class to handle all types of interactions.
module.exports = class InteractionCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = Events.InteractionCreate;
    }

    // Method that runs when an interaction event is triggered
    run(interaction) {
        // Check if the interaction is a slash command
        if (interaction.isCommand()) {
            const command = this.client.slashCommands.get(interaction.commandName); // Fetch the command from the collection
            if (!command) return; // If the command is not found, do nothing

            // Prevent command execution in DMs if the command is guild-only (ephemeral reply is only visible to the user who triggered the command)
            if (command.guildOnly && interaction.channel.type === ChannelType.DM) {
                return interaction.reply({ content: "I can\'t execute that command inside DMs!", ephemeral: true });
            }

            // Check if the user has the necessary permissions to execute the command
            if (command.permissions) {
                const authorPerms = interaction.channel.permissionsFor(interaction.user);
                if (!authorPerms || !authorPerms.has(command.permissions)) {
                    return interaction.reply({ content: "You don\'t have the necessary permissions to execute this command!", ephemeral: true });
                }
            }

            // Execute the command with error handling
            try {
                command.execute(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            }
        }

        // Check if the interaction is a button press
        if (interaction.isButton()) {
            const button = this.client.interactions.get(interaction.customId); // Fetch the button action from the collection
            if (!button) return; // If the button is not found, do nothing

            // Execute the button with error handling
            try {
                button.execute(interaction);
            } catch (error) {
                console.error(error); // Log any errors to the console
                interaction.reply({ content: "There was an error while executing this button!", ephemeral: true }); // Send an ephemeral reply to the user
            }
        }
    }
}