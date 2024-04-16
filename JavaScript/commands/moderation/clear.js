const { EmbedBuilder } = require("discord.js");

module.exports = class ClearCommand {
    constructor(client) {
        this.client = client;
        this.name = "clear";
        this.aliases = ["delete", "purge"];
        this.description = "Deletes messages in the channel.";
        this.usage = "<amount>";
        this.guildOnly = true;
        this.permissions = "MANAGE_MESSAGES";
        this.args = true;
        this.cooldown = 5;
    }

    // Method to execute the command, responding to the user's message
    // "args" is an array of arguments provided by the user
    async execute(message, args) {
        // Parse the first argument as an integer (the amount of messages to delete)
        const requestedAmount = parseInt(args[0]);

        // Validate the parsed number to ensure it is a valid and sensible quantity
        if (isNaN(requestedAmount)) {
            return message.reply("That doesn't seem to be a valid number.");
        }

        // Ensure the number is within the allowed range of 1 to 999 messages
        if (requestedAmount < 1 || requestedAmount > 999) {
            return message.reply("You need to input a number between 1 and 999.");
        }

        const actualAmount = requestedAmount + 1; // Increase the count by one to account for the command message itself
        let messagesDeleted = 0; // Counter for successfully deleted messages
        let batch = 0; // Counter for messages fetched in batches of 100
        let failures = 0; // Counter for messages that failed to be deleted due to being older than 14 days

        // Loop to handle deletion in batches (Discord API limitation)
        while (batch < actualAmount) {
            const fetchAmount = Math.min(100, actualAmount - batch); // Determine the number of messages to fetch (max 100 per API limit)
            const messages = await message.channel.messages.fetch({ limit: fetchAmount });
            // Filter messages that are younger than 14 days (API deletion limit)
            const filterOldMessages = messages.filter(m => (Date.now() - m.createdTimestamp) < 1209600000);  // 14 days in milliseconds
            const tooOldMessages = fetchAmount - filterOldMessages.size; // Count messages that are too old to delete

            failures += tooOldMessages;

            // Attempt to delete the filtered messages
            if (filterOldMessages.size > 0) {
                await message.channel.bulkDelete(filterOldMessages, true)
                    .then(deletedMessages => {
                        messagesDeleted += deletedMessages.size; // Update the counter for deleted messages
                    })
                    .catch(error => {
                        console.error("Failed to delete messages:", error);
                        message.channel.send("There was an error trying to delete messages.");
                        return;
                    });
            }

            batch += fetchAmount; // Update the batch counter

            // Wait to prevent hitting the rate limit
            if (batch < actualAmount) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second interval between batches
            }
        }

        // Generate a status message about the operation
        // If there were failures, indicate the number of messages that were not deleted due to being older than 14 days
        const failureMessage = failures > 0 ? `\`${failures}\` messages were not deleted because they are older than 14 days.` : "All messages within the given range were deleted successfully.";
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Messages Deleted")
                    .setDescription(`Successfully deleted ${messagesDeleted - 1} messages.\n\n${failureMessage}`)
                    .setColor("#00FF00")
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            ]
        });
    }
}