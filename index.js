// Load the TCP Library
net = require('net');
const { exec } = require('child_process');

// Keep track of the chat clients
var clients = [];
//Array of roomsNames
var rooms = []; 


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
          console.log(clients)
        
          socket.write("Olá, pode chatear agora " + socket.name + "\n" + "Você está na sala: " + socket.roomName+"\n");
            // Send a nice welcome message and announce
            broadcast(socket.name + " Conectou nessa sala \n", socket, socket.roomName);
      
      // }else if(data.startsWith('exec:')){
      //   var code = data.split(':')[1]
      //   exec(`node -e "console.log(${code})"`,{},(e,out,err)=>{
      //       broadcast(`${code} ->   ${out.toString()}`)
      //   })
      
    }else if (data.startsWith('listarSalas')){
      var uniqueRooms = [... new Set(rooms)]
      var i;
      for (i = 0; i<uniqueRooms.length; i++){
        socket.write(uniqueRooms[i] + '\n')
      }
    } //Change the room 
      else if(data.startsWith('mudarSala:')){
      var NewName = data.split(':')[1].replace('\\r\\n','')
      changeRoom(socket.name, NewName, socket.roomName)
      socket.write(socket.name + " seja bem-vindo a sala " + socket.roomName)
      broadcast(socket.name + " Conectou nessa sala \n", socket, socket.roomName);
    }else if(data.startsWith('.exit')){
      Delete(socket.name, socket.roomName)
    }
      else if(socket.name === null ){
          socket.write("Me diga seu nome e a sala. Digite 'name: SEUNOME: NomedaSala: FIM'\n")
      }else{
        broadcast(socket.name + "("+ socket.roomName +")" + ">" + data, socket, socket.roomName);
      }
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " Desconectou do chat.\n");
  });

function Delete(name, atualRoom){
  clients.forEach(function(client){
    if(client.name == name){
      clients.splice(client, 1);
      broadcast(name + " Desconectou do chat.\n", name, atualRoom);
  }})};

  function changeRoom(name, newRoom,atualRoom){
    clients.forEach(function(client){
      if(client.name == name){
        client.roomName = newRoom;
        rooms.push(newRoom)
      }

    })
    broadcast(name + " Desconectou da sala("+ atualRoom +").\n", name, atualRoom)
    
  }
   
  // Send a message to all clients
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