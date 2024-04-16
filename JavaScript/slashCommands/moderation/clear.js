/**
 * This command is the same as the prefix one, but it uses the interaction object to reply to the user.
 * The arguments are fetched using the interaction.options object to get the provided options.
 */

const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = class ClearCommand {
    constructor(client) {
        this.client = client;
        this.name = "clear";
        this.description = "Deletes messages in the channel.";
        this.guildOnly = true;
        this.permissions = "MANAGE_MESSAGES";
        this.cooldown = 5;

        this.options = [
            {
                name: "amount",
                type: ApplicationCommandOptionType.Integer,
                description: "The amount of messages to delete.",
                required: true
            }
        ];
    }

    async execute(interaction) {
        // Get the amount value from interaction
        // We don't need to check if the number like in the prefix version because Discord will handle it for us
        const requestedAmount = interaction.options.getInteger("amount");

        // Initial response to defer reply, necessary for commands taking longer time to execute (interaction timeout is 3 seconds)
        await interaction.deferReply();

        if (isNaN(requestedAmount)) {
            return interaction.editReply("That doesn't seem to be a valid number.");
        }

        if (requestedAmount < 1 || requestedAmount > 999) {
            return interaction.editReply("You need to input a number between 1 and 999.");
        }

        const actualAmount = requestedAmount + 1;
        let messagesDeleted = 0;
        let batch = 0;
        let failures = 0;

        while (batch < actualAmount) {
            const fetchAmount = Math.min(100, actualAmount - batch);
            const messages = await interaction.channel.messages.fetch({ limit: fetchAmount });
            const filterOldMessages = messages.filter(m => (Date.now() - m.createdTimestamp) < 1209600000);  // 14 days in milliseconds
            const tooOldMessages = fetchAmount - filterOldMessages.size;

            failures += tooOldMessages;

            if (filterOldMessages.size > 0) {
                await interaction.channel.bulkDelete(filterOldMessages, true)
                    .then(deletedMessages => {
                        messagesDeleted += deletedMessages.size;
                    })
                    .catch(error => {
                        console.error("Failed to delete messages:", error);
                        interaction.channel.send("There was an error trying to delete messages.");
                        return;
                    });
            }

            batch += fetchAmount;

            if (batch < actualAmount) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        const failureMessage = failures > 0 ? `\`${failures}\` messages were not deleted because they are older than 14 days.` : "All messages within the given range were deleted successfully.";
        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Messages Deleted")
                    .setDescription(`Successfully deleted ${messagesDeleted - 1} messages.\n\n${failureMessage}`)
                    .setColor("#00FF00")
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            ]
        });
    }
}