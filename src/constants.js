const typeSeatEnum = {
    0: 'Ghế thường',
    1: 'Ghế VIP',
    2: 'Ghế Couple'
}

const allAccess = {
    0: 'Thể loại phim',
    1: 'Phim',
    2: 'Đạo diễn',
    3: 'Diễn viên',
    4: 'Thức ăn',
    5: 'Combo',
    6: 'Mã khuyến mãi',
    7: 'Người dùng',
    8: 'Rạp phim',
    9: 'Nhân viên',
    10: 'Giá vé',
    11: 'Lịch chiếu',
    12: 'Suất chiếu',
    13: 'Đặt vé',
    14: 'Đặt combo, bắp nước',
    15: 'Danh sách vé',
    16: 'In vé',
    17: 'Quảng cáo'
}

const typeSurcharge = {
    0: '3D',
    1: 'IMAX',
    2: 'Ghế VIP',
    3: 'Ghế Couple',
};

const typeRoom = {
    0: '2D',
    1: '3D',
    2: 'IMAX'
}

const typeSchedule = {
    0: 'Đã chiếu',
    1: 'Đang chiếu',
    2: 'Sắp chiếu'
}

const typeShowTime = {
    0: 'Chiếu sớm',
    1: 'Theo lịch',
}

const timePrice = {
    0: 'Thứ 2 đến thứ 5 trước 17h',
    1: 'Thứ 2 đến thứ 5 sau 17h',
    2: 'Thứ 6 đến chủ nhật trước 17h',
    3: 'Thứ 6 đến chủ nhật sau 17h'
}

const typeUser = {
    1: 'Học sinh, sinh viên',
    2: 'Người lớn',
    3: 'Người già, trẻ em',
    4: 'Thành viên, vé trực tuyến'
}

const typePay = {
    0: 'Chờ thanh toán',
    1: 'Thanh toán thành công',
    2: 'Thanh toán không thành công',
}

const methodPay = {
    0: 'Thanh toán Momo',
    1: 'Thanh toán tiền mặt',
};

const standardAge = [
    'P - Thích hợp cho mọi độ tuổi',
    'K - Người xem dưới 13 tuổi với điều kiện xem cùng cha mẹ hoặc người giám hộ',
    'T13 - Cấm người dưới 13 tuổi',
    'T16 - Cấm người dưới 16 tuổi',
    'T18 - Cấm người dưới 18 tuổi',
    'C - Phim không được phép phổ biến',
];

const signAge = [
    'P',
    'K',
    'T13',
    'T16',
    'T18',
    'C',
];

const statusTicket = {
    0: 'Vé không hợp lệ',
    1: 'Vé hợp lệ',
}

const typeStatistical = {
    0: '7 ngày gần nhất',
    1: 'Tháng này',
    2: 'Tháng trước',
    3: 'Trong năm'
}

module.exports = {
    typeSeatEnum,
    allAccess,
    typeSchedule,
    typeShowTime,
    timePrice,
    typeUser,
    typeRoom,
    typeSurcharge,
    typePay,
    methodPay,
    standardAge,
    signAge,
    statusTicket,
    typeStatistical
};