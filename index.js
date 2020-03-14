// Load the TCP Library
net = require('net');
const { exec } = require('child_process');

// Keep track of the chat clients
var clients = [];


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
          socket.write("olá, pode chatear agora " + socket.name + "\n");
            // Send a nice welcome message and announce
            broadcast(socket.name + " Conectou ao chat\n", socket);

      }else if(data.startsWith('exec:')){
        var code = data.split(':')[1]
        exec(`node -e "console.log(${code})"`,{},(e,out,err)=>{
            broadcast(`${code} ->   ${out.toString()}`)
        })
      }
      else if(socket.name === null ){
          socket.write("Me diga seu nome. Digite 'name: SEUNOME:FIM'\n")
      }else{
        broadcast(socket.name + "> " + data, socket);
      }
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " Desconectou do chat.\n");
  });
   
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server na porta 5000\n");