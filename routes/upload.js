//引入http
const http=require("http");
//引入express
const express=require("express");
//引入multer
const multer=require("multer");
/*var server=http.createServer(app);*/
var router = express.Router();
 
//建立public文件夹，将HTML文件放入其中，允许访问
// router.use(express.static("public"));
//文件上传所需代码
//设置文件上传路径和文件命名
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        //文件上传成功后会放入public下的upload文件夹
        cb(null, '../public/upload')
    },
    filename: function (req, file, cb){
        //设置文件的名字为其原本的名字，也可以添加其他字符，来区别相同文件，例如file.originalname+new Date().getTime();利用时间来区分
          cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});
 
//处理来自页面的ajax请求。single文件上传
router.post('/upload', upload.single('file'), function (req, res, next) {
    //拼接文件上传后的网络路径
	console.log("file:"+req.file.originalname)
    var url = 'http://' + req.headers.host + '/upload/' + req.file.originalname;
  
    res.end(req.file.originalname);
});
 
// 单域多文件上传：input[file]的 multiple=="multiple"
router.post('/upload', upload.array('file', 5), function(req, res, next) {
    // req.files 是 前端表单name=="imageFile" 的多个文件信息（数组）,限制数量5，应该打印看一下
    var fileName = ""
    for (var i = 0; i < req.files.length; i++) {
        // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
        // 对临时文件转存，fs.rename(oldPath, newPath,callback);
        fileName+=req.files[i].originalname+";"
        fs.rename(req.files[i].path, "upload/" + req.files[i].originalname, function(err) {
            if (err) {
                throw err;
            }
            console.log('done!');
        })
    }
 
 
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*"//允许跨域。。。
    });
      // req.body 将具有文本域数据, 如果存在的话
//  res.end(JSON.stringify(req.files)+JSON.stringify(req.body));
	console.log("fileName:"+fileName)
	res.end(fileName)
})
 
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
module.exports = router;
// 原文链接：https://blog.csdn.net/jishoujiang/article/details/80367683