// Importa as classes e módulos necessários
const { Events, ActivityType } = require("discord.js");
const { client: { presence } } = require("../../config.json");

// Define a classe ReadyEvent que é disparada quando o bot fica pronto após fazer login
module.exports = class ReadyEvent {
    constructor(client) {
        this.client = client; // Instância do cliente do bot Discord
        this.name = Events.ClientReady; // Define o nome do evento para o evento interno "ClientReady"
    }

    // Método que é executado quando o evento é disparado
    run() {
        // Registra uma mensagem no console indicando que o bot está online e mostra o nome de usuário e o discriminador do bot
        console.log(`Bot está online! Logado como ${this.client.user.tag}.`);

        // Define o status de atividade do bot para "online" e a atividade para "Ouvindo comandos"
        // O método "setPresence" recebe um objeto com as propriedades "status" e "activities"
        // Isso pode demorar um momento para atualizar, então pode não aparecer imediatamente
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