var app = require('express')();
server = require('http').createServer(app);
io = require('socket.io').listen(server);


// Crée une liste utilisateur et une liste todo sur le serveur si non existante
app.use((req, res, next) => {
    if (server.users == undefined) server.users = [];
    if (server.todos == undefined) server.todos = [];
    next();
})

// Envoi la page 'index.html'
app.get('/', (req, res) => {
    res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {

    // Ajoute l'utilisateur nouvellement connecté à la liste utilisateur et met à jour l'affichage pour tout le monde
    socket.on('nouveau', (pseudo) => {
        socket.pseudo = pseudo;
        console.log(socket.pseudo + "s'est connecté");
        server.users.push(pseudo);
        socket.emit("updateUser", server.users);
        socket.emit("updateList", server.todos);
        socket.broadcast.emit("updateUser", server.users);
    })

    // Ajoute la nouvelle entrée dans la liste todo et met à jour l'affichage pour tout le monde
    socket.on('newtodo', (todo) => {
        if (todo.trim() != "") {
            server.todos.push(todo);
            socket.emit("updateList", server.todos);
            socket.broadcast.emit("updateList", server.todos);
        }
    })

    // Supprime le todo sélectionné de la liste todo et met à jour l'affichage pour tout le monde
    socket.on('deleteOne', (id) => {
        server.todos.splice(id, 1);
        socket.emit("updateList", server.todos);
        socket.broadcast.emit("updateList", server.todos);
    })

    // Supprime l'utilisateur quittant la page de la liste utilisateur et met à jour l'affichage pour tout le monde
    socket.on('disconnect', () => {
        server.users.splice(server.users.indexOf(socket.pseudo), 1);
        console.log(socket.pseudo + "s'est déconnecté");
        socket.broadcast.emit("updateUser", server.users);
     });

});

server.listen(8080);