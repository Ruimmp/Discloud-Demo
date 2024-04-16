const { Events, ChannelType } = require("discord.js");

// Define a classe InteractionCreateEvent para lidar com todos os tipos de interações.
module.exports = class InteractionCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = Events.InteractionCreate;
    }

    // Método que é executado quando um evento de interação é disparado
    run(interaction) {
        // Verifica se a interação é um comando de barra
        if (interaction.isCommand()) {
            const command = this.client.slashCommands.get(interaction.commandName); // Busca o comando na coleção
            if (!command) return; // Se o comando não for encontrado, não faz nada

            // Impede a execução do comando em DMs se o comando for apenas para guildas (a resposta efêmera só é visível para o usuário que acionou o comando)
            if (command.guildOnly && interaction.channel.type === ChannelType.DM) {
                return interaction.reply({ content: "Não posso executar esse comando dentro das DMs!", ephemeral: true });
            }

            // Verifica se o usuário tem as permissões necessárias para executar o comando
            if (command.permissions) {
                const authorPerms = interaction.channel.permissionsFor(interaction.user);
                if (!authorPerms || !authorPerms.has(command.permissions)) {
                    return interaction.reply({ content: "Você não tem as permissões necessárias para executar este comando!", ephemeral: true });
                }
            }

            // Executa o comando com tratamento de erro
            try {
                command.execute(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: "Houve um erro ao executar este comando!", ephemeral: true });
            }
        }

        // Verifica se a interação é um pressionamento de botão
        if (interaction.isButton()) {
            const button = this.client.interactions.get(interaction.customId); // Busca a ação do botão na coleção
            if (!button) return; // Se o botão não for encontrado, não faz nada

            // Executa o botão com tratamento de erro
            try {
                button.execute(interaction);
            } catch (error) {
                console.error(error); // Registra quaisquer erros no console
                interaction.reply({ content: "Houve um erro ao executar este botão!", ephemeral: true }); // Envia uma resposta efêmera para o usuário
            }
        }
    }
}