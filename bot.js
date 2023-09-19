const venom = require('venom-bot');

venom
  .create({
    session: 'session-name' // Nome da sessão
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

const userSessions = {}; // Rastreia as sessões dos usuários

function start(client) {
  client.onMessage(async (message) => {
    try {
      const sender = message.from;
      let session = userSessions[sender] || {};
      const userMessage = message.body;

      if (!session.step) {
        // Se o usuário não estiver em nenhum passo de coleta, comece coletando o nome completo
        session.step = 1;
        await client.sendText(message.from, 'Para podermos prosseguir com a solicitação, precisamos de alguns dados.\n\nPor favor, digite seu nome completo:');
      } else {
        // O usuário está em algum passo de coleta, continue coletando informações
        switch (session.step) {
          case 1:
            session.fullName = userMessage;
            session.step = 2;
            await client.sendText(message.from, 'Ótimo! Agora, por favor, digite sua idade:');
            break;
          case 2:
            if (!isNaN(userMessage)) {
              session.age = userMessage;
              session.step = 3;
              await client.sendText(message.from, 'Ótimo! Agora, por favor, digite sua cidade:');
            } else {
              await client.sendText(message.from, 'Por favor, digite apenas números para a idade:');
            }
            break;
          case 3:
            // Usar uma expressão regular flexível para aceitar qualquer tipo de palavra com ou sem acentos e espaços
            if (/^[\w\sáéíóúàèìòùãẽĩõũâêîôûäëïöüç]+$/i.test(userMessage)) {
              session.city = userMessage;
              session.step = 4;
              await client.sendText(message.from, 'Perfeito! Agora, por favor, digite o estado:');
            } else {
              await client.sendText(message.from, 'Por favor, digite um nome de cidade válido:');
            }
            break;
          case 4:
            // Usar uma expressão regular flexível para aceitar qualquer tipo de palavra com ou sem acentos e espaços
            if (/^[\w\sáéíóúàèìòùãẽĩõũâêîôûäëïöüç]+$/i.test(userMessage)) {
              session.state = userMessage;
              session.step = 5;
              await client.sendText(message.from, `Você digitou as seguintes informações:\n\nNome Completo: ${session.fullName}\nIdade: ${session.age}\nCidade: ${session.city}\nEstado: ${session.state}\n\nOs dados estão corretos? Digite "sim" ou "não":`);
            } else {
              await client.sendText(message.from, 'Por favor, digite um nome de estado válido:');
            }
            break;
          case 5:
            if (userMessage.toLowerCase() === 'sim') {
              
              delete userSessions[sender];
              await client.sendText(message.from, 'Ótimo! Agradecemos pelas informações. Seus dados foram enviados. Aguarde, logo entraremos em contato.');
              return; // Encerra a interação aqui
            } else if (userMessage.toLowerCase() === 'não' || userMessage.toLowerCase() === 'nao') {
              // Usuário deseja recomeçar, retorne ao primeiro passo
              session = {};
              session.step = 1;
              await client.sendText(message.from, 'Vamos começar de novo. Por favor, digite seu nome completo:');
            } else {
              // Resposta inválida, peça ao usuário para digitar "sim" ou "não"
              await client.sendText(message.from, 'Por favor, digite "sim" se os dados estiverem corretos ou "não" para recomeçar:');
            }
            break;
        }
      }

      // Atualize a sessão do usuário
      userSessions[sender] = session;
    } catch (error) {
      console.error('Erro ao processar a mensagem: ', error);
    }
  });
}


