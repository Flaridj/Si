const dns2 = require('dns2');  // Bibliothèque pour gérer le serveur DNS

const server = dns2.createServer({
  udp: true,
  tcp: true,
  handle: (request, response) => {
    const questions = request.questions;
    
    questions.forEach(question => {
      const domain = question.name.toLowerCase();
      const type = question.type;
      
      if (domain === '_discord.mcdonalds.fr.' && type === 'TXT') {
        response.answer.push({
          name: domain,
          type: dns2.Packet.TYPE.TXT,
          class: dns2.Packet.CLASS.IN,
          ttl: 300,
          data: 'dh=22a53ba0b9bdbdc9326de5510b56632254b8c4ea'
        });
      } else {
        response.header.rcode = dns2.Packet.RCODE.NOERROR;
      }
      
      response.header.qr = 1;
      response.header.aa = 1;
    });
  }
});

server.on('request', (request, response) => {
  console.log('Requête DNS reçue:', request.questions[0]?.name || 'Inconnu');
  server.send(response);
});

server.on('error', (error) => {
  console.error('Erreur du serveur DNS:', error.message);  // Amélioré pour mobile, avec message court
});

// Lance sur un port plus safe pour mobile, comme 5353 pour éviter les conflits
const port = 5353;  // Changeable si needed
server.listen(port, '0.0.0.0').then(() => {
  console.log(`Serveur DNS fake lancé sur le port ${port}. Redirige tes requêtes DNS vers ici.`);
}).catch((err) => {
  console.error('Échec du lancement du serveur:', err);  // Gestion d'erreur pour permissions
});
