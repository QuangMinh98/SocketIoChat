var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const bodyParser = require('body-parser')
const cookie = require('cookie-parser')
app.set('view engine', 'ejs')
app.use(cookie())

app.use(bodyParser.urlencoded({extended: false}));

var manguser= []

var number = 0

var checkLogin = function (req, res ,next) {
    if(!req.cookies.name){
        res.redirect('/login')
    }
    else{
        next()
    }
}

//Tạo router
app.get("/", checkLogin ,function (req, res) {
    //res.sendFile(__dirname + '/client.html');
    if(manguser.indexOf(req.cookies.name)<0){
        manguser.push(req.cookies.name)
    }
    console.log(manguser.length)
    res.render("client",{manguser:manguser,name: req.cookies.name})
});

app.get("/login",(req, res) => {
    //res.sendFile(__dirname + '/login.html');
    res.render("login")
})

app.post("/login",(req, res) =>{
    var {username,password} = req.body
    if(password === "admin" && manguser.indexOf(username) < 0){
        let user = username
        res.cookie('name',user,{maxAge: 1000 *3600})
        manguser.push(user)
        res.redirect("./");
    }
    else{
        res.redirect("./login")
    }
})

io.on('connection', function (socket) {
    console.log('Welcome to server chat: '+socket.id);
    socket.on('send', function (data) {
        number = number + 1;
        console.log(number)
        io.sockets.emit('send', data);
    });
    socket.on('join', function (data) {
        if(manguser.indexOf(data)<0){
            manguser.push(data)
        }
        let data_user = {
            manguser: manguser,
            data: data
        }
        socket.username = data
        socket.broadcast.emit('join', data_user);
    })
    socket.on('disconnect', function (){
        manguser.splice(manguser.indexOf(socket.username),1)
        let data_user = {
            manguser: manguser,
            data: socket.username
        }
        socket.broadcast.emit('disconn',data_user)
    })
});




//Tạo socket 
//Khởi tạo 1 server listen tại 1 port
server.listen(3000);