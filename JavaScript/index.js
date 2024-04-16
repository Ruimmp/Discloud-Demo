/**
 * This is the main file of the bot. It creates an instance of the Bot class and logs into Discord.
 */

// Import the necessary classes and modules
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

require("dotenv").config(); // Load environment variables from .env file

class Bot extends Client {
    constructor() {
        super({
            intents: Object.values(GatewayIntentBits), // Use all available gateway intents
            partials: Object.values(Partials) // Use all available partials for handling incomplete data
        });

        // Create collections to store commands, slash commands, and interactions
        // These collections will be used to easily access commands, slash commands, and interactions by their names
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.interactions = new Collection();
        this.cooldowns = new Collection();

        // Load events, commands, slash commands, and interactions
        // Events are loaded using the client's on method to listen to events
        // Commands, slash commands, and interactions are loaded by creating instances of the classes and storing them in collections
        this.loadEvents();
        this.loadCommands();
        this.loadSlashCommands();
        this.loadInteractions();

        this.login(process.env.DISCORD_CLIENT_TOKEN); // Log into Discord with the token from .env
    }

    // Function to load files recursively from a directory and register them using a provided function
    loadFilesRecursively(dirPath, registerFunction) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        files.forEach(file => {
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) { // If it's a directory, recurse into it to load files
                this.loadFilesRecursively(fullPath, registerFunction);
            } else if (file.name.endsWith('.js')) { // If it's a JavaScript file, register it using the provided function
                registerFunction(fullPath);
            }
        });
    }

    loadEvents() {
        const foldersPath = path.join(__dirname, "events");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const event = new (require(filePath))(this);
            this.on(event.name, (...args) => event.run(...args)); // Register event listeners
        });
    }

    // For commands, we simply load them and store them in a collection
    loadCommands() {
        const foldersPath = path.join(__dirname, "commands");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const command = new (require(filePath))(this);
            this.commands.set(command.name, command); // Register each command
        });
    }

    // For slash commands it's a bit different, as we need to register them with Discord
    loadSlashCommands() {
        const foldersPath = path.join(__dirname, "slashCommands");
        const commands = [];
        this.loadFilesRecursively(foldersPath, async (filePath) => {
            const command = new (require(filePath))(this);
            this.slashCommands.set(command.name, command); // Register each slash command
            commands.push(command); // Collect for bulk registration
        });

        this.on("ready", async (client) => {
            // Register all slash commands with Discord once the client is ready
            await client.application.commands.set(commands);
        });

    }

    loadInteractions() {
        const foldersPath = path.join(__dirname, "interactions");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const interaction = new (require(filePath))(this);
            this.interactions.set(interaction.id, interaction); // Register each interaction handler
        });
    }
}

new Bot(); // Create a new instance of the Bot class
