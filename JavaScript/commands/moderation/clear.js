const { EmbedBuilder } = require("discord.js");

module.exports = class ClearCommand {
    constructor(client) {
        this.client = client;
        this.name = "clear";
        this.aliases = ["delete", "purge"];
        this.description = "Apaga uma quantidade de mensagens no canal atual.";
        this.usage = "<quantidade>";
        this.guildOnly = true;
        this.permissions = "MANAGE_MESSAGES";
        this.args = true;
        this.cooldown = 5;
    }

    // Método para executar o comando, respondendo à mensagem do usuário
    // "args" é um array de argumentos fornecidos pelo usuário
    async execute(message, args) {
        // Analisa o primeiro argumento como um número inteiro (a quantidade de mensagens a deletar)
        const requestedAmount = parseInt(args[0]);

        // Valida o número analisado para garantir que é uma quantidade válida e sensata
        if (isNaN(requestedAmount)) {
            return message.reply("Isso não parece ser um número válido.");
        }

        // Garante que o número está dentro do intervalo permitido de 1 a 999 mensagens
        if (requestedAmount < 1 || requestedAmount > 999) {
            return message.reply("Você precisa inserir um número entre 1 e 999.");
        }

        const actualAmount = requestedAmount + 1; // Aumenta a contagem em um para contabilizar a mensagem de comando
        let messagesDeleted = 0; // Contador para mensagens deletadas com sucesso
        let batch = 0; // Contador para mensagens buscadas em lotes de 100
        let failures = 0; // Contador para mensagens que falharam ao ser deletadas por serem mais velhas que 14 dias

        // Loop para lidar com a deleção em lotes (limitação da API do Discord)
        while (batch < actualAmount) {
            const fetchAmount = Math.min(100, actualAmount - batch); // Determina o número de mensagens a buscar (máximo de 100 por limite da API)
            const messages = await message.channel.messages.fetch({ limit: fetchAmount });
            // Filtra mensagens que são mais jovens que 14 dias (limite de deleção da API)
            const filterOldMessages = messages.filter(m => (Date.now() - m.createdTimestamp) < 1209600000);  // 14 dias em milissegundos
            const tooOldMessages = fetchAmount - filterOldMessages.size; // Conta mensagens que são muito velhas para deletar

            failures += tooOldMessages;

            // Tenta deletar as mensagens filtradas
            if (filterOldMessages.size > 0) {
                await message.channel.bulkDelete(filterOldMessages, true)
                    .then(deletedMessages => {
                        messagesDeleted += deletedMessages.size; // Atualiza o contador de mensagens deletadas
                    })
                    .catch(error => {
                        console.error("Falha ao deletar mensagens:", error);
                        message.channel.send("Houve um erro ao tentar deletar mensagens.");
                        return;
                    });
            }

            batch += fetchAmount; // Atualiza o contador de lotes

            // Espera para evitar atingir o rate limit da API do Discord
            if (batch < actualAmount) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Intervalo de 2 segundos entre lotes
            }
        }

        // Gera uma mensagem de status sobre a operação
        // Se houve falhas, indica o número de mensagens que não foram deletadas por serem mais velhas que 14 dias
        const failureMessage = failures > 0 ? `\`${failures}\` mensagens não foram deletadas porque são mais velhas que 14 dias.` : "Todas as mensagens dentro do intervalo dado foram deletadas com sucesso.";
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Mensagens Deletadas")
                    .setDescription(`Foram deletadas com sucesso ${messagesDeleted - 1} mensagens.\n\n${failureMessage}`)
                    .setColor("#00FF00")
                    .setTimestamp()
                    .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            ]
        });
    }
}