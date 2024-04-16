// Imports the necessary classes and modules
const { Events, ActivityType } = require("discord.js");
const { client: { presence } } = require("../../config.json");

// Defines the ReadyEvent class that triggers when the bot becomes ready after logging in
module.exports = class ReadyEvent {
    constructor(client) {
        this.client = client; // Client instance of the Discord bot
        this.name = Events.ClientReady; // Sets the event name to the built-in 'ClientReady' event
    }

    // Method that runs when the event is triggered
    run() {
        // Logs a message to the console indicating the bot is online and shows the bot's username and discriminator
        console.log(`Bot is online! Logged in as ${this.client.user.tag}.`);

        // Sets the bot's activity status to 'online' and the activity to 'Listening to commands'
        // The 'setPresence' method takes an object with the 'status' and 'activities' properties
        // This can take a moment to update, so it may not show immediately
        this.client.user.setPresence({
            status: presence.status,
            activities: [
                {
                    name: presence.activity.name,
                    type: ActivityType[presence.activity.type]
                }
            ]
        });
    }
}