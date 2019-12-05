export const responseJSON = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '-1',
            message: '操作失败'
        });
    } else {
        res.json({
            code: '0',
            data: ret
        });
    }
};