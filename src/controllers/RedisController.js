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
        const seatsAlreadyHeld = [];
        await Promise.all(seatId.map(async item => {
            const result = await client.hGet(reservationKey, item);
            // console.log(result)

            if (result) {
                seatsAlreadyHeld.push(item);
            } else {
                await client.hSet(reservationKey, item, userId);
                await client.expire(reservationKey, 180); 
            }
        }))

        if (seatsAlreadyHeld.length > 0) {
            return res.status(400).json({
                message: `Ghế này đã được mua. Vui lòng chọn ghế khác.`
            });
        }
        return res.status(200).json('Giữ ghế thành công');

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
};

const testHold = async (req, res) => {
    const { seatId, showTime } = req.query;
    const reservationKey = `showTime:${showTime}`;
    const seatArray = seatId.split(',');
    console.log(seatArray)
    try {
        const seatsAlreadyHeld = [];
        await Promise.all(seatArray.map(async item => {
            const result = await client.hGet(reservationKey, item);

            if (result) {
                seatsAlreadyHeld.push(item);
            }
        }))

        if (seatsAlreadyHeld.length > 0) {
            return res.status(400).json({
                message: `Ghế này đã được mua. Vui lòng chọn ghế khác.`
            });
        } else {
            return res.status(200).json({
                message: 'OK'
            });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allHold = async (req, res) => {
    const { showTime } = req.query;
    const reservationKey = `showTime:${showTime}`;
    
    
    try {
        const result = await client.hGetAll(reservationKey);

        // console.log('y',result);
        // console.log(result);
        
        return res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const cancelHold = async (req, res) => {
    const { showTime, seatId } = req.query;
    const reservationKey = `showTime:${showTime}`;
    const seatArray = seatId.split(',');
    // console.log(seatArray);
    try {
        const data = await Promise.all(seatArray.map(async item => {
            await client.hDel(reservationKey, item);
        }))
        return res.status(200).json({
            message: 'Xóa thành công'
        });
        
        // const result = await client.hDel(reservationKey, seatId);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const cancelAllHold = async (req, res) => {
//     const { userId } = req.query; // Lấy userId từ query parameters
//     try {
//         // Lấy tất cả keys
//         const keys = await client.keys('*');
        
//         // Lặp qua các keys và kiểm tra xem có chứa userId không
//         const deletePromises = keys.map(async (key) => {
//             const result = await client.hGetAll(key); // Lấy tất cả dữ liệu trong hash
            
//             // Nếu userId tồn tại trong dữ liệu, xóa key
//             if (result && Object.values(result).includes(userId)) {
//                 await client.del(key);
//             }
//         });

//         // Chờ tất cả các promises hoàn thành
//         await Promise.all(deletePromises);

//         return res.status(200).json({
//             message: 'Xóa tất cả dữ liệu của userId thành công'
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         });
//     }
// };

const cancelAllHold = async (req, res) => {
    const { userId } = req.query;

    try {
        const showTimes = await client.keys('showTime:*');

        let removedSeats = [];

        for (const showTime of showTimes) {
            const seats = await client.hGetAll(showTime);
            
            const seatsToRemove = Object.keys(seats).filter(seat => seats[seat] === userId);

            console.log('yyyy',seatsToRemove);
            await Promise.all(seatsToRemove.map(async item => {
                await client.hDel(showTime, item);
                removedSeats.push(...seatsToRemove); 
            }))
            // if (seatsToRemove.length > 0) {
            //     const data =await client.hDel(showTime, ...seatsToRemove);
            //     removedSeats.push(...seatsToRemove); 
            // }
        }
        return res.status(200).json({ message: "OK" });
        // if (removedSeats.length > 0) {
        //     res.status(400).json({ message: "Đã hủy giữ ghế thành công" });
        // } else {
        //     res.status(200).json({ message: "Không có ghế nào được giữ bởi người dùng này." });
        // }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra khi xóa các ghế của người dùng.", error });
    }
};



const holdPay = async (req, res) => {
    const { seatId, userId, showTime } = req.body;
    const reservationKey = `showTime:${showTime}`;

    try {
        let ttl
        const results = await Promise.all(seatId.map(async item => {
            const result = await client.hGet(reservationKey, item);
            // console.log(result)

            if (result) {
                ttl = await client.ttl(reservationKey);
            } else {
                await client.hSet(reservationKey, item, userId);
                await client.expire(reservationKey, 180); 
                ttl = await client.ttl(reservationKey);
            }
        }))
        return res.status(200).json(ttl);

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
};

module.exports = {
    holdSeat,
    testHold,
    allHold,
    cancelHold,
    cancelAllHold,
    holdPay
}