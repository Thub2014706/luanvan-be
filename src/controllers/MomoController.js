var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const { default: axios } = require('axios');
const crypto = require('crypto');
const { addOrderTicket } = require('./OrderTicketController');
const OrderTicketModel = require('../models/OrderTicketModel');
const { typePay, standardAge, signAge } = require('../constants');
const OrderComboModel = require('../models/OrderComboModel');
const UserModel = require('../models/UserModel');
const { transporter } = require('./EmailController');
const ShowTimeModel = require('../models/ShowTimeModel');
const SeatModel = require('../models/SeatModel');
const TheaterModel = require('../models/TheaterModel');
const ScheduleModel = require('../models/ScheduleModel');
const FilmModel = require('../models/FilmModel');
const RoomModel = require('../models/RoomModel');
const moment = require('moment');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const path = require('path');
const fs = require('fs');

const momoPost = async (req, res, urlRedirectUrl, urlIpnUrl) => {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var orderInfo = 'Thanh toán với MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = `${urlRedirectUrl}`;
    var ipnUrl = `https://22be-14-237-179-233.ngrok-free.app/api/momo/${urlIpnUrl}`;
    var requestType = "payWithMethod";
    var amount = req.body.amount;
    var orderId = 'CINE' + new Date().getTime();
    var requestId = orderId;
    var extraData ='';
    var orderGroupId ='';
    var autoCapture =true;
    var lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    //puts raw signature
    // console.log("--------------------RAW SIGNATURE----------------")
    // console.log(rawSignature)
    
    //signature
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    // console.log("--------------------SIGNATURE----------------")
    // console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        partnerName : "Test",
        storeId : "MomoTestStore",
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        lang : lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData : extraData,
        orderGroupId: orderGroupId,
        signature : signature
    });

    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }

    let result;
    try {
        result = await axios(options)
        return res.status(200).json(result.data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const momoTicket = async (req, res) => momoPost(req, res, 'http://localhost:3002/book-tickets/success', 'callback-ticket')
const momoCombo = async (req, res) => momoPost(req, res, 'http://localhost:3002/order-food/success', 'callback-combo')
const momoTicketCustomer = async (req, res) => momoPost(req, res, 'http://localhost:3000/checkout', 'callback-ticket')

const callback = async (req, res, model) => {
    console.log("callback:")
    console.log(req.body)
    const { resultCode, orderId } = req.body
    try {
        if (resultCode === 0) {
            await model.findOneAndUpdate({idOrder: orderId}, {status: typePay[1]}, {new: true})
    
            const detailOrder = await model.findOne({idOrder: orderId})
            const user = await UserModel.findById(detailOrder.member)
    
            const showTimeDetail = await ShowTimeModel.findById(detailOrder.showTime)
            const theater = await TheaterModel.findById(showTimeDetail.theater)
            const schedule = await ScheduleModel.findById(showTimeDetail.schedule)
            const film = await FilmModel.findById(schedule.film)
            const sign = signAge[standardAge.findIndex(item => item === film.age)]
            const roomDetail = await RoomModel.findById(showTimeDetail.room)
            // const staffDetail = await StaffModel.findById(staff)
            const seat0 = await SeatModel.findById(detailOrder.seat[0])
            let seatsHTML = '';
            if (detailOrder.seat && detailOrder.seat.length > 0) {
                const seats = await Promise.all(detailOrder.seat.map(async item => {
                    const seatDetail = await SeatModel.findById(item)
                    return String.fromCharCode(64 + seatDetail.row) + seatDetail.col;
                }))
                seatsHTML = seats.join(', ');
            }
    
            const canvas = createCanvas();
    
            JsBarcode(canvas, orderId, {
                height: 50,
                width: 1,
                fontSize: 10,
                fontOptions: "Courier New, monospace"
            });
            dataUrl = canvas.toDataURL('image/png')
            const imgPath = path.join(__dirname, `../../uploads/${Date.now()}-${orderId}`)
            const base64Data = dataUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64'); 
            fs.writeFileSync(imgPath, buffer); 
            console.log(imgPath);
            
    
            await transporter.sendMail({
                from: `"CINETHU" <${process.env.EMAIL_ACCOUNT}>`, // sender address
                to: `${user.email}`, // list of receivers
                subject: "Vé xem phim tại CINETHU", // Subject line
                text: `Xin chào ${user.username},
                Đây là thông tin vé xem phim của bạn. Vui lòng kiểm tra và đưa vé này cho nhân viên soát vé để được vào rạp nhé!`, // plain text body
                html: `<p>Xin chào ${user.username},</p>
                <br />
                Đây là thông tin vé xem phim của bạn. Vui lòng kiểm tra và đưa vé này cho nhân viên soát vé để được vào rạp nhé!
                <br />
                <div>
                    <div style="
                        margin: auto;
                        padding: 30px;
                        font-family: 'Courier New', monospace;
                        width: 400px;
                    ">
                        <h4 style="font-weight: bold; text-align: center;">
                            THE VAO
                            <br /> PHONG CHIEU PHIM
                        </h4>
                        <div>
                            <p style="font-weight: bold;">${theater.name}</p>
                            <p>
                                ${theater.address}, ${theater.ward}, ${theater.district}, ${theater.province}
                            </p>
                           
                            <p>==========================================</p>
                            <p>
                                <span style="font-weight: bold; font-size: 1.25rem; margin-right: 5px;">${film.name}</span>
                                <span>[${sign}]</span>
                            </p>
                            <p>
                                <span>${moment(showTimeDetail.date).format('DD/MM/YYYY')}</span>
                                <span style="margin-left: 50px;">
                                    ${showTimeDetail.timeStart} - ${showTimeDetail.timeEnd}
                                </span>
                            </p>
                            <p>
                                <span style="margin-right: 5px; font-weight: bold;">${roomDetail.name}</span>
                                <span style="font-weight: bold;">
                                    ${seatsHTML}
                                </span>
                                <span style="margin-left: 5px;">${seat0.type}</span>
                            </p>
                            <p>------------------------------------------</p>
                            <p>==========================================</p>
                            <p style="text-align: right; font-weight: bold; font-size: 1.25rem;">
                                <span style="margin-right: 3rem;">Tong</span>
                                <span style="margin-right: 3rem;">VND</span>
                                <span>${detailOrder.price.toLocaleString('it-IT')}</span>
                            </p>
                            <div style="display: flex; justify-content: center;">
                                <img src="cid:ticketBarcode" />
                            </div>
                        </div>
                    </div>
                </div>
                <br />
                Chân thành cảm ơn quý khách!
                <br />`, // html body
                attachments: [
                    {
                        filename: `${Date.now()}-${orderId}.png`, 
                        path: imgPath,
                        cid: 'ticketBarcode' 
                    }
                ]
            });
        } else {
            await model.findOneAndUpdate({idOrder: orderId}, {status: typePay[2]}, {new: true})
        }
        
        res.status(200).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const callbackTicket = async (req, res) => callback(req, res, OrderTicketModel)

const callbackCombo = async (req, res) => callback(req, res, OrderComboModel)


const checkStatus = async (req, res) => {
    const { orderId } = req.body;
    
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
  
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  
    const requestBody = JSON.stringify({
      partnerCode: 'MOMO',
      requestId: orderId,
      orderId: orderId,
      signature: signature,
      lang: 'vi',
    });
  
    // options for axios
    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/query',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    };
  
    const result = await axios(options);
  
    return res.status(200).json(result.data);
};
  

module.exports = {
    momoTicket,
    momoCombo,
    callbackTicket,
    callbackCombo,
    checkStatus,
    momoTicketCustomer
}