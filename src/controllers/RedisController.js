const redis = require('redis');

const client = redis.createClient({
    url: 'redis://127.0.0.1:6380' 
});

const connectRedis = async () => {
    
    await client.connect()

    client.on('error', (err) => {
        console.error(`An error occurred with Redis: ${err}`)
    })

    console.log('Redis connected successfully...')
}

connectRedis();

const holdSeat = async (req, res) => {
    const { seatId, userId, showTime } = req.body;
    const reservationKey = `showTime:${showTime}`;

    try {
        const results = await Promise.all(seatId.map(async item => {
            const result = await client.hGet(reservationKey, item);
            console.log(result)

            if (result) {
                return res.status(400).json({
                    message: `Ghế ${item} đã được giữ bởi người dùng ${result}.`
                });
            } else {
                await client.hSet(reservationKey, item, userId);
                // console.log('1',data)
            }
        }))
        await client.expire(reservationKey, 180); 
        return res.status(200).json(results);

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
};

const allHold = async (req, res) => {
    const { showTime } = req.query;
    const reservationKey = `showTime:${showTime}`;

    try {
        const result = await client.hGetAll(reservationKey);
        console.log(result);
        
        return res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const cancelHold = async (req, res) => {
    const { showTime, seatId } = req.body;
    const reservationKey = `showTime:${showTime}`;

    try {
        const data = await Promise.all(seatId.map(async item => {
            await client.hDel(reservationKey, item);
        }))
        console.log(data);
        
        // const result = await client.hDel(reservationKey, seatId);
    } catch (error) {
        console.log(req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    holdSeat,
    allHold,
    cancelHold
}