var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const { default: axios } = require('axios');
const crypto = require('crypto');
const { addOrderTicket } = require('./OrderTicketController');
const OrderTicketModel = require('../models/OrderTicketModel');
const { typePay } = require('../constants');
const OrderComboModel = require('../models/OrderComboModel');

const momoPost = async (req, res, urlRedirectUrl, urlIpnUrl) => {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var orderInfo = 'Thanh toán với MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = `http://localhost:3002/${urlRedirectUrl}`;
    var ipnUrl = `https://1a9a-113-162-197-22.ngrok-free.app/api/momo/${urlIpnUrl}`;
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

const momoTicket = async (req, res) => momoPost(req, res, 'book-tickets/success', 'callback-ticket')
const momoCombo = async (req, res) => momoPost(req, res, 'order-food/success', 'callback-combo')

const callback = async (req, res, model) => {
    console.log("callback:")
    console.log(req.body)
    const { resultCode, orderId } = req.body
    if (resultCode === 0) {
        await model.findOneAndUpdate({idOrder: orderId}, {status: typePay[1]}, {new: true})
    } else {
        await model.findOneAndUpdate({idOrder: orderId}, {status: typePay[2]}, {new: true})
    }
    try {
        
        res.status(200).json(req.body)
    } catch (error) {
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
}