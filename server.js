import express from 'express'
import http from 'http'
import socketIo from 'socket.io'

const app = express();

const server = http.createServer(app);
const PORT = 5000

let broadcasts = {

};

let rooms = {

}

const io = socketIo(server)

io.sockets.on('connection', socket => {
  socket.on('broadcaster', (room) => {
    broadcasts[room] = socket.id
    socket.broadcast.emit('broadcaster')
  })

  socket.on('watcher', (room) => {
    const streamer = broadcasts[room]
    if (streamer) {
      socket.to(streamer).emit('watcher', socket.id)
      rooms[socket.id] = room
    }
  })

  socket.on('offer', (id, message) => { //Watcher
    socket.to(id).emit('offer', socket.id, message) // Broadcaster
  })

  socket.on('answer', (id, message) => { // Broadcaster
    socket.to(id).emit('answer', socket.id, message) //Watcher
  })

  socket.on('candidate', (id, message) => {
    socket.to(id).emit('candidate', socket.id, message)
  })

  socket.on('disconnect', () => {
    const room = rooms[socket.id]
    if (room) {
      broadcasts[room] && socket.to(broadcasts[room]).emit('bye', socket.id);
      delete rooms[socket.id]
    }
  })
})

io.sockets.on('error', e => console.log(e));

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));