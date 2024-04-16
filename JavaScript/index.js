/**
 * Este é o arquivo principal do bot. Ele cria uma instância da classe Bot e faz login no Discord.
 */

// Importa as classes e bibliotecas necessárias
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

require("dotenv").config(); // Carrega variáveis de ambiente do arquivo .env

class Bot extends Client {
    constructor() {
        super({
            intents: Object.values(GatewayIntentBits), // Usa todas as intents disponíveis para ouvir eventos
            partials: Object.values(Partials) // Usa todos os partials disponíveis para lidar com dados incompletos
        });

        // Cria collections para armazenar comandos, slash commands e interações
        // Estas collections serão usadas para acessar facilmente comandos, slash commands e interações pelo nome
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.interactions = new Collection();
        this.cooldowns = new Collection();

        // Carrega eventos, comandos, slash commands e interações
        // Eventos são carregados usando o método on do cliente para escutar eventos
        // Comandos, slash commands e interações são carregados criando instâncias das classes e armazenando-as em collections
        this.loadEvents();
        this.loadCommands();
        this.loadSlashCommands();
        this.loadInteractions();

        this.login(process.env.DISCORD_CLIENT_TOKEN); // Faz login no Discord com o token do .env
    }

    // Função para carregar arquivos recursivamente de um diretório e registrá-los usando uma função fornecida
    loadFilesRecursively(dirPath, registerFunction) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        files.forEach(file => {
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) { // Se for um diretório, recursivamente carrega arquivos
                this.loadFilesRecursively(fullPath, registerFunction);
            } else if (file.name.endsWith(".js")) { // Se for um arquivo JavaScript, registra usando a função fornecida
                registerFunction(fullPath);
            }
        });
    }

    loadEvents() {
        const foldersPath = path.join(__dirname, "events");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const event = new (require(filePath))(this);
            this.on(event.name, (...args) => event.run(...args)); // Registra listeners de eventos
        });
    }

    // Para comandos, simplesmente os carregamos e armazenamos em uma collection
    loadCommands() {
        const foldersPath = path.join(__dirname, "commands");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const command = new (require(filePath))(this);
            this.commands.set(command.name, command); // Registra cada comando
        });
    }

    // Para slash commands é um pouco diferente, pois precisamos registrá-los no Discord
    loadSlashCommands() {
        const foldersPath = path.join(__dirname, "slashCommands");
        const commands = [];
        this.loadFilesRecursively(foldersPath, async (filePath) => {
            const command = new (require(filePath))(this);
            this.slashCommands.set(command.name, command); // Registra cada slash command na collection
            commands.push(command); // Coleta para registro em massa
        });

        this.on("ready", async (client) => {
            // Registra todos os slash commands no Discord quando o cliente estiver pronto
            await client.application.commands.set(commands);
        });

    }

    loadInteractions() {
        const foldersPath = path.join(__dirname, "interactions");
        this.loadFilesRecursively(foldersPath, (filePath) => {
            const interaction = new (require(filePath))(this);
            this.interactions.set(interaction.id, interaction); // Registra cada manipulador de interação
        });
    }
}

new Bot(); // Cria uma nova instância da classe Bot
