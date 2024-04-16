const { Events, ChannelType, Collection } = require("discord.js");
const { prefix } = require("../../config.json");  // Importa o prefixo do arquivo de configuração

module.exports = class MessageCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = Events.MessageCreate;
    }

    run(message) {
        if (message.author.bot) return;  // Ignora mensagens enviadas por bots
        if (!message.content.startsWith(prefix)) return;  // Ignora qualquer mensagem que não comece com o prefixo definido

        // Analisa a mensagem em um nome de comando e argumentos
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();  // Extrai o nome do comando e o torna minúsculo

        // Busca o comando na coleção de comandos do cliente ou seus aliases
        const command = this.client.commands.get(commandName) || this.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;  // Se o comando não for encontrado, não faz nada

        // Verifica se o comando é destinado a ser executado apenas em guildas
        if (command.guildOnly && message.channel.type === ChannelType.DM) {
            return message.reply("Eu não posso executar esse comando dentro de DMs!");
        }

        // Verifica se o usuário que está executando tem as permissões necessárias para usar o comando
        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return message.reply("Você não tem as permissões necessárias para executar esse comando!");
            }
        }

        // Verifica se o comando requer argumentos e se eles foram fornecidos
        if (command.args && !args.length) {
            let reply = `Você não forneceu nenhum argumento, ${message.author}!`;

            if (command.usage) {
                reply += `\nA forma correta de uso seria: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);  // Envia a informação de uso
        }

        // Lida com os cooldowns do comando usando uma Collection armazenada no cliente
        // Se o comando não tem um cooldown, define como 3 segundos por padrão para evitar abuso de spam
        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            // Verifica se o usuário ainda está no período de cooldown e informa sobre o tempo restante
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Por favor, espere mais ${timeLeft.toFixed(0)} segundo${timeLeft > 1 ? "s" : ""} antes de reutilizar o comando \`${command.name}\`.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);  // Remove o timestamp após o período de cooldown

        try {
            command.execute(message, args);  // Executa o comando com os argumentos fornecidos
        } catch (error) {
            console.error(error);  // Registra quaisquer erros no console
            message.reply("Houve um erro ao tentar executar esse comando!");  // Informa o usuário sobre o erro
        }
    }
};