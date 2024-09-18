const redis = require('redis');

const getRedis = async (req, res) => {
    try {
        const client = redis.createClient();
        await client.connect();
        console.time('LOG_TIME');
        const value = await client.get('userId');
        //value is exists
        if(value) {
            console.timeEnd('LOG_TIME');
            return res.json({status: 200, message: 'OK'})
        }
        axios({
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/todos/1',
        }).then(async response => {
            const {userId} = response.data;
            //send data to redis
            await client.set('userId', userId);
            console.timeEnd('LOG_TIME');
            return res.json(JSON.stringify(response.data));
        }).catch(async e => {
            console.log(e);
            return res.json({status: 500, message: 'error'});
        })
    } catch (e) {
        console.log(e);
        return res.status(500);
    }
};

module.exports = {
    getRedis
}