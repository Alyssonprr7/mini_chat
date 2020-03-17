// Load the TCP Library
net = require('net');

//Loading package color
var colors = require('colors');

// Keep track of the chat clients
var clients = [];

//Array of roomsNames
var rooms = ["SalaGeral"]; 

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = null
  
  // Put this new client in the list
  clients.push(socket);

  // Handle incoming messages from clients.
  socket.on('data', function (buffer) {
      var data = buffer.toString()
      if(data.startsWith("name:")){
          console.log("kkkkkk", data)
          socket.name = data.split(':')[1].replace('\\r\\n','')
          socket.roomName = data.split(':')[2].replace('\\r\\n','')
          rooms.push(socket.roomName)
          socket.write("Olá, pode chatear agora " + socket.name + "\n" + "Você está na sala: " + colors.yellow(socket.roomName)+ colors.magenta("\n\nINSTRUÇÕES:\n") +
          "-Usuários inativos por 2 minutos serão deslogados\n-Não é permitido o uso da palavra 'Foda'\n\n" +
          colors.magenta("COMANDOS:\n") + colors.blue("listarSalas") + "=> Listará todas as salas\n" + colors.blue("mudarSala:'nomeDaSala'") + "=> Vai mudar a sua sala. Lembrando que caso a sala não exista, será criado uma nova\n" 
          + colors.blue("deletarSala") + "=> Irá deletar uma sala. Tenha cuidado pois os usuário da sala serão automaticamente encaminhados para a 'SalaGeral'\n" 
          + colors.blue(".sair") + "=> Você se desconectará do chat\n" + colors.red("AVISO IMPORTANTE:NÃO TENTE EXCLUIR A SALA GERAL\n\n"));
          // Send a nice welcome message and announce
          broadcast(colors.green(socket.name) + " Conectou nessa sala \n", socket.name, socket.roomName);
    
      //List the rooms
    }else if (data.includes('listarSalas')){
      var uniqueRooms = [...new Set(rooms)]
      var i;
      for (i = 0; i<uniqueRooms.length; i++){
        socket.write(colors.yellow(uniqueRooms[i]) + '\n')
      }
       
    } //Change the room 
      else if(data.startsWith('mudarSala:')){
        var NewName = data.split(':')[1].replace('\r\n','')
        changeRoom(socket.name, NewName, socket.roomName)
        socket.write(socket.name + " seja bem-vindo a sala " + colors.yellow(socket.roomName) + "\n")
        broadcast(colors.green(socket.name) + " Conectou na sala " + colors.yellow(socket.roomName) + "\n", socket.name, socket.roomName);
        
      //Remove user for bad words
    }else if(data.includes('foda')){
      socket.pause()
      socket.write("VOCÊ FOI SILENCIADO POR 40 SEGUNDOS POR USAR PALAVRÕES\n");
      setTimeout(function(){ socket.resume()}, 40000)

    }else if (data.startsWith('deletarSala:')){
      var room = data.split(':')[1].replace('\r\n','')
      if(room != "SalaGeral"){
      deleteRoom(room)
      socket.write("Se a sala " + colors.yellow(room) + " existia, ela foi "+ colors.red("deletada\n"))
    }else {
      socket.end("EU AVISEI PRA NÃO TENTAR EXCLUIR A SALAGERAL\n")
    }

    }else if(socket.name === null ){
      socket.write("Me diga seu nome e a sala. Digite 'name: SEUNOME: NomedaSala: FIM'\n")

      //Leave the server
    }else if(data.startsWith('.sair')){
      socket.end("Obrigado por usar nosso serviço, " + colors.red(socket.name)+"\n")   
      broadcast(colors.red(socket.name) + " Desconectou do chat.\n")

      }else{
        broadcast(socket.name + colors.yellow("(")+ colors.yellow(socket.roomName) +colors.yellow(")") + ">" + data, socket, socket.roomName);
      }
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(colors.red(socket.name) + " Desconectou do chat.\n");
  });

  // Remove the client for inactivity 
  socket.setTimeout(120000)
  socket.on('timeout', function () {
    socket.end("Você foi desconectado por inatividade\n")
  });

  //Change the room when the user wants
  function changeRoom(name, newRoom,atualRoom){
    clients.forEach(function(client){
      if(client.name == name){
        client.roomName = newRoom;
        rooms.push(newRoom)
      }
    })
    broadcast(colors.red(name) + " Desconectou da sala("+ colors.yellow(atualRoom) +").\n", name, atualRoom)
  }

  function deleteRoom (deletableRoom){
    clients.forEach(function(client){
      if(client.roomName == deletableRoom){
        client.roomName = rooms[0]
        client.write("Sua sala foi deletada por algum usuário\nVocê foi transferido para a " + colors.yellow("SalaGeral\n"))
      }
    rooms.forEach(function(room){
        if(room == deletableRoom){
          rooms.splice(rooms.indexOf(room), 1)
        }
      })
    })
  }

  // Send a message to clients in the specific room
  function broadcast(message, sender,room) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      // Don't send to other room
      if (room != client.roomName) return; 
      client.write(message);
    });

    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server na porta 5000\n");