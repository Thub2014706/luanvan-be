var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const { default: axios } = require('axios');
const crypto = require('crypto');
const { addOrderTicket } = require('./OrderTicketController');
const OrderTicketModel = require('../models/OrderTicketModel');
const { typePay } = require('../constants');

const momoPost = async (req, res) => {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var orderInfo = 'Thanh toán với MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = `http://localhost:3002/book-tickets/success`;
    var ipnUrl = 'https://3329-14-184-65-120.ngrok-free.app/api/momo/callback';
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
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const callback = async (req, res) => {
    console.log("callback:")
    console.log(req.body)
    const { resultCode, orderId } = req.body
    if (resultCode === 0) {
        await OrderTicketModel.findOneAndUpdate({idOrder: orderId}, {status: typePay[1]}, {new: true})
    } else {
        await OrderTicketModel.findOneAndUpdate({idOrder: orderId}, {status: typePay[2]}, {new: true})
    }
    try {
        
        res.status(200).json(req.body)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

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
    momoPost,
    callback,
    checkStatus,
}