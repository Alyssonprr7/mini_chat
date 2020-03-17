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
          socket.write("Olá, pode chatear agora " + socket.name + "\n" + "Você está na sala: " + colors.yellow(socket.roomName)+"\n");
          // Send a nice welcome message and announce
          broadcast(colors.green(socket.name) + " Conectou nessa sala \n", socket.name, socket.roomName);
      
    }else if (data.startsWith('listarSalas')){
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
    //}else if(data.startsWith('.exit')){
    }else if (data.startsWith('deletarSala:')){
      var room = data.split(':')[1].replace('\r\n','')
      deleteRoom(room)
      socket.write("Se a sala " + colors.red(room) + " existia, ela foi deletada\n")
    }
      else if(socket.name === null ){
          socket.write("Me diga seu nome e a sala. Digite 'name: SEUNOME: NomedaSala: FIM'\n")
      }else{
        broadcast(socket.name + colors.yellow("(")+ colors.yellow(socket.roomName) +colors.yellow(")") + ">" + data, socket, socket.roomName);
      }
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(colors.red(socket.name) + " Desconectou do chat.\n");
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
    rooms.forEach(function(room){
      if(deletableRoom == room){
        rooms.splice(rooms.indexOf(room), 1)
        clients.forEach(function(client){
          if(client.room = deletableRoom){
            client.roomName = rooms[0]
            client.write("Sua sala foi deletada por algum usuário\nVocê foi transferido para a " + colors.yellow("SalaGeral\n") ) 
          }
        })
      }
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