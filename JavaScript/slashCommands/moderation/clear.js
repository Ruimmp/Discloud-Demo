/**
 * Este comando é o mesmo que o de prefixo, mas utiliza o objeto de interação para responder ao usuário.
 * Os argumentos são obtidos usando o objeto interaction.options para pegar as opções fornecidas.
 */

const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = class ClearCommand {
    constructor(client) {
        this.client = client;
        this.name = "clear";
        this.description = "Apaga uma quantidade de mensagens no canal atual.";
        this.guildOnly = true;
        this.permissions = "MANAGE_MESSAGES";
        this.cooldown = 5;

        this.options = [
            {
                name: "amount",
                type: ApplicationCommandOptionType.Integer,
                description: "A quantidade de mensagens a serem apagadas.",
                required: true
            }
        ];
    }

    async execute(interaction) {
        // Obtém o valor de quantidade da interação
        // Não precisamos verificar se é um número como na versão de prefixo porque o Discord vai lidar com isso para nós
        const requestedAmount = interaction.options.getInteger("amount");

        // Resposta inicial para diferir a resposta, necessário para comandos que demoram mais para executar (o tempo de espera da interação é de 3 segundos)
        await interaction.deferReply();

        if (requestedAmount < 1 || requestedAmount > 999) {
            return interaction.editReply("Você precisa inserir um número entre 1 e 999.");
        }

        const actualAmount = requestedAmount + 1;
        let messagesDeleted = 0;
        let batch = 0;
        let failures = 0;

        while (batch < actualAmount) {
            const fetchAmount = Math.min(100, actualAmount - batch);
            const messages = await interaction.channel.messages.fetch({ limit: fetchAmount });
            const filterOldMessages = messages.filter(m => (Date.now() - m.createdTimestamp) < 1209600000);  // 14 dias em milissegundos
            const tooOldMessages = fetchAmount - filterOldMessages.size;

            failures += tooOldMessages;

            if (filterOldMessages.size > 0) {
                await interaction.channel.bulkDelete(filterOldMessages, true)
                    .then(deletedMessages => {
                        messagesDeleted += deletedMessages.size;
                    })
                    .catch(error => {
                        console.error("Falha ao deletar mensagens:", error);
                        interaction.channel.send("Houve um erro ao tentar deletar mensagens.");
                        return;
                    });
            }

            batch += fetchAmount;

            if (batch < actualAmount) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        const failureMessage = failures > 0 ? `\`${failures}\` mensagens não foram deletadas porque são mais velhas que 14 dias.` : "Todas as mensagens dentro do intervalo dado foram deletadas com sucesso.";
        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Mensagens Apagadas")
                    .setDescription(`Foram deletadas com sucesso ${messagesDeleted - 1} mensagens.\n\n${failureMessage}`)
                    .setColor("#00FF00")
                    .setTimestamp()
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            ]
        });
    }
}