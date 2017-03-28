var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ConnectFourDB');
var connectFourSchema = mongoose.Schema({ 
  session: {type: String, required: true},
  board: [],
  turn: {type: Number, min: 0, max: 2, default: 0}, 
  player1: {type: String, default: "Unknown"},
  player2: {type: String, default: "Unknown"},
  updated: {type: Date, default: Date.now}
});
var Board = mongoose.model('Board', connectFourSchema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected');
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Connect Four' });
});

router.get('/tester', function(req, res, next) {
  res.render('tester',{ title: 'Testing Platform'});
});

router.get('/win', function(req, res, next) {
  res.render('finish', { title: 'You Win!!' });
});

router.get('/lose', function(req, res, next) {
  res.render('finish', { title: 'You Lose.' });
});

add_to_column=function(board, column, player){
  if(board[column].length<6)
    board[column].push(player);
  return board;
}

check_format=function(body){
  var output ={};
  if(body.board != undefined && body.board != null && typeof(body.board)==='object' && body.board.length==7){
    var good_board=true;
    for(var i=0; i<7; i++){
      if(typeof(body.board[i]) != "object" || body.board[i].length==undefined || body.board[i].length == null || body.board[i].length>=7 || body.board[i].length<0){ good_board=false; break;}
      for(var j=0; j<body.board[i].length; j++){
        if(typeof(body.board[i][j]) != "number" || !(body.board[i][j] == 0 || body.board[i][j] == 1 || body.board[i][j] == 2)){good_board=false; break;}
      }
    }
    if(good_board==true) output.board=body.board;
  }
  if(body.turn != undefined && body.turn != null && typeof(body.turn)==='number' && (body.turn === 1 || body.turn===2)) output.turn=body.turn;
  if(body.session != undefined && body.session != null && typeof(body.session)==='string' && body.session.length <25) output.session=body.session;
  if(body.player1 != undefined && body.player1 != null && typeof(body.player1)==='string' && body.player1.length <25) output.player1=body.player1;
  if(body.player2 != undefined && body.player2 != null && typeof(body.player2)==='string' && body.player2.length <25) output.player2=body.player2;
  return output;
}

router.post('/board', function(req, res, next) {
  if(req.body == undefined || req.body == null || typeof(req.body) != 'object' || req.body.session == undefined || req.body.session == null) res.sendStatus(206);
  Board.findOne({'session': req.body.session}, function(error, foundsession) {
    if(foundsession && !error){
      var conditions = { session: req.body.session };
      if(req.body.move != undefined && req.body.move != null && typeof(req.body.move) ==='object' && req.body.move.player != undefined && req.body.move.player != null && typeof(req.body.move.player) === 'number' && ((req.body.move.player === 1 && foundsession.turn===1) || (req.body.move.player === 2 && foundsession.turn===2)) && req.body.move.column != undefined && req.body.move.column != null && typeof(req.body.move.column) === 'number' && req.body.move.column>=0 && req.body.move.column<=7){
        var update = { $set: { turn: ((req.body.move.player==1)? 2 : 1), board: add_to_column(foundsession.board, req.body.move.column, req.body.move.player)}};
      } else {
        var update = { $set: check_format(req.body)};
      }
      var options = { multi: true };
      Board.update(conditions, update, options, function(err,num){
        if(err) return console.error(err); 
      });
      return;
    } else if(!foundsession) {
      var newboard = new Board(check_format(req.body)); 
      newboard.save(function(err, post) {
      if (err) return console.error(err);
      return;
      });
    } else {
      console.error(error);
      return;
    }
  });
  Board.findOne({'session': req.body.session}, function(err,foundboard) {
    if (err) return console.error(err);
    else {
      res.json(foundboard);
    }
  })
});

router.get('/board',function(req, res, next) {
  Board.findOne({'session': req.query.session}, function(err,foundboard) {
    if (err) return console.error(err);
    else {
      res.json(foundboard);
    }
  })
});

router.delete('/board', function(req, res, next) {
  Board.findOne({'session':req.query.session}).remove().exec();
});

module.exports = router;
