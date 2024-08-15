const userRouter = require('./UserRouter')
const genreRouter = require('./GenreRouter')
const filmRouter = require('./FilmRouter')
const directorRouter = require('./DirectorRouter')
const performerRouter = require('./PerformerRouter')
const foodRouter = require('./FoodRouter')
const comboRouter = require('./ComboRouter')
const discountRouter = require('./DiscountRouter')
const theaterRouter = require('./TheaterRouter')
const roomRouter = require('./RoomRouter')
const seatRouter = require('./SeatRouter')

const routes = (app) => {
    app.use('/api/user/', userRouter)
    app.use('/api/genre/', genreRouter)
    app.use('/api/film/', filmRouter)
    app.use('/api/director/', directorRouter)
    app.use('/api/performer/', performerRouter)
    app.use('/api/food/', foodRouter)
    app.use('/api/combo/', comboRouter)
    app.use('/api/discount/', discountRouter)
    app.use('/api/theater/', theaterRouter)
    app.use('/api/room/', roomRouter)
    app.use('/api/seat/', seatRouter)

}

module.exports = routes