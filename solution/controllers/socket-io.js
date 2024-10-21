//SERVER SIDE CODE

const chat = require('../controllers/chat')

/**
 * Initialise socket.io
 *
 * @param io
 */
exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            /**
             * create or joins a room
             */
            socket.on('join', (room, userId) => {
                console.log('joining...')
                socket.join(room);

                //get the chats from the database
                chat.withSightingId(room)
                    .then((result) => {
                        socket.emit('joined', room, userId, result)
                    })
                    .catch((err) => {
                        //handle error
                    })
            })



            /**
             * send chat messages
             */
            socket.on('message', function(room, userId, message) {
                socket.to(room).emit('chat', room, userId, message)

                chat.create(room, userId, message)
                    .catch(function() {
                        console.log('chat save failed')
                    })
            })

            /**
             * disconnect
             */
            socket.on('disconnect')

        } catch (e) {
        }
    });
}