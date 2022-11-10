let express = require("express");
let app = express();

let Datastore = require("nedb");

let db = new Datastore("course.db");
let db2 = new Datastore("poll.db");

let courseList = ["Algorithms","Data Structures","Calculus","Markets","Connections Lab","Linear Algebra","Intro to CS","Math-1000","Intro to Logic","Discrete Math","FYWS","Mutivariable Calculus","Data and Society","Data Analysis","Computer Networks","Operating Systems","Computer System Organization"];

db.loadDatabase();
db2.loadDatabase();

app.use('/', express.static('public'));


let http = require("http");
let server = http.createServer(app);

server.listen( 3000 , ()=> {
    console.log('listening');
});


let io = require("socket.io");
io = new io.Server(server);

app.get('/courses', (req,res)=>{
    res.json({courseArray : courseList });
});


app.get('/comments', (req,res)=>{
    
    let c = req.query.selectedCourse;

    db.find({courseName : c}).sort({ updateAt: 1 }).exec(function (err, docs) {
        if(err) {
            res.json({task: "task failed"})
        } 
        else {
            let obj = {comments: docs};
            res.json(obj);
        }
      });

});


app.get('/polls', (req,res)=> {

    let c = req.query.selectedCourse;
    db2.find({courseName : c}).sort({ updateAt: 1 }).exec(function (err, docs) {
        if(err) {
            res.json({task: "task failed"})
        } 
        else {
            let obj = {poll : docs};
            res.json(obj);
            console.log(obj)
        }
        });
});

io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);
    
    socket.on('data', (data)=>{     // Listening for comment data values

        console.log(data);
        db.insert(data, (err, newDoc)=>{
            console.log(newDoc);
            console.log(err);
        });

        io.sockets.emit('sdata',data);
    })


    socket.on('poll', (polldata)=>{ // Listening for poll values

        console.log(polldata);
        db2.insert(polldata, (err, newDoc)=>{
            if(err)
            {
                console.log(err.message);
            }
            //console.log(newDoc);
        });

        io.sockets.emit('polldata',polldata);   
    })

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
    });

});