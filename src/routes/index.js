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
const staffRouter = require('./StaffRouter')
const scheduleRouter = require('./ScheduleRouter')
const priceRouter = require('./PriceRouter')
const surchargeRouter = require('./SurchargeRouter')
const showTimeRouter = require('./ShowTimeRouter')
const momoRouter = require('./MomoRouter')
const orderTicketRouter = require('./OrderTicketRouter')
const orderComboRouter = require('./OrderComboRouter')
const redisRouter = require('./RedisRouter')
const printTicketRouter = require('./PrintTicketRouter')
const ticketRefundRouter = require('./TicketRefundRouter')
const commentRouter = require('./CommentRouter')
const statisticalRouter = require('./StatisticalRouter')
const AdvertisementRouter = require('./AdvertisementRouter')
const EventRouter = require('./EventRouter')
const NewsRouter = require('./NewsRouter')

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
    app.use('/api/staff/', staffRouter)
    app.use('/api/schedule/', scheduleRouter)
    app.use('/api/showtime/', showTimeRouter)
    app.use('/api/price/', priceRouter)
    app.use('/api/surcharge/', surchargeRouter)
    app.use('/api/momo/', momoRouter)
    app.use('/api/order-ticket/', orderTicketRouter)
    app.use('/api/order-combo/', orderComboRouter)
    app.use('/api/redis/', redisRouter)
    app.use('/api/print-ticket/', printTicketRouter)
    app.use('/api/ticket-refund/', ticketRefundRouter)
    app.use('/api/comment/', commentRouter)
    app.use('/api/statistical/', statisticalRouter)
    app.use('/api/advertisement/', AdvertisementRouter)
    app.use('/api/event/', EventRouter)
    app.use('/api/news/', NewsRouter)

}

module.exports = routes