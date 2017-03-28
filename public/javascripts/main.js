var board
var gameID
var name
var turn
var player
var size

$(document).ready(function() {
  doModal()
})

function doModal() {
  $('#myModal').modal('show')
}

function closeModal(){
  setInterval(getBoard, 3000)
  runPage()
}

function modalSubmit() {
  name = $('#name').val()
  gameID = $('#gameID').val()
  size=3
  board=[[0,0,0],[0,0,0],[0,0,0]]

  if (name == '' || gameID == '') {
    $('#alert').html('<div class="alert alert-warning">Name and game ID cannot be left blank.</div>');
    return
  }

  if ($('#newGame').is(':checked')) {
    var data = {
      "session" : gameID,
      "player1" : name,
      "size" : size,
      "turn": 1,
      "board": board
    }
    $.ajax({
      url: '/board',
      method: 'POST',
      contentType: "application/json;odata=verbose",
      data: JSON.stringify(data),
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function(res) {
        console.log("Game Created");
        console.log(res);
        $('#myModal').modal('toggle')
        player = 1
        closeModal();
      },
      failure: function() {
        console.log('Server error. Try again')
      }
    })
  }
  else {
    $.ajax({
      url: '/board?session=' + gameID,
      method: 'GET',
      headers: { "Accept": "application/json; odata=verbose" },
      success: function(json) {
        console.log("Finding board:");
        console.log(json);
        if(json==null || json==undefined){
          console.log("Board not found");
          $('#alert').html('<div class="alert alert-warning">Game ID does not exist. Please create a new game or try again.</div>');
        }
        else {
          var data = {
            "session" : gameID,
            "player2" : name
          }
          $.ajax({
            url: '/board',
            method: 'POST',
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(data),
            headers: {
              "Accept": "application/json;odata=verbose"
            },
            success: function(res) {
              console.log("Game joined");
              console.log(res)
              $('#myModal').modal('hide')
              player = 2
              closeModal();
            },
            failure: function() {
              console.log('Server error. Try again');
            }
          })
        }
      },
      failure: function(){
        console.log('Server error. Try again');
      }
    })
  }
}

function getBoard() {
  $.ajax({
    url: '/board?session=' + gameID,
    method: 'GET',
    headers: { "Accept": "application/json; odata=verbose" },
    success: function(json) {
      console.log("Board Recieved");
      paintBoard(json)
    },
    failure: function(){
      console.log('Server error. Try again');
    }
  })
}

function paintBoard(json) {
  console.log("Making Board");
  board = json.board
  turn = json.turn
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j] == 1) {
        $('#' + (i+1).toString() + (j+1).toString()).text("X")
      }
      if (board[i][j] == 2) {
        $('#' + (i+1).toString() + (j+1).toString()).text("O")
      }
    }
  }
  $('#turn').text((turn==1? json.player1 : json.player2)+"\'s Turn");
  $('#prompt').text(((turn==player)? "It's your turn. Go ahead and move!":"It's not your turn. You're going to have to wait for the other player."));
  testFinish();
}

function runPage() {
  turn = 1
  $('#11').click(function(){
    if(turn==player && board[0][0] == 0) madeMove(0,0)
  })
  $('#12').click(function(){
    if(turn==player && board[0][1] == 0) madeMove(0,1)
  })
  $('#13').click(function(){
    if(turn==player && board[0][2] == 0) madeMove(0,2)
  })
  $('#21').click(function(){
    if(turn==player && board[1][0] == 0) madeMove(1,0)
  })
  $('#22').click(function(){
    if(turn==player && board[1][1] == 0) madeMove(1,1)
  })
  $('#23').click(function(){
    if(turn==player && board[1][2] == 0) madeMove(1,2)
  })
  $('#31').click(function(){
    if(turn==player && board[2][0] == 0) madeMove(2,0)
  })
  $('#32').click(function(){
    if(turn==player && board[2][1] == 0) madeMove(2,1)
  })
  $('#33').click(function(){
    if(turn==player && board[2][2] == 0) madeMove(2,2)
  })
}

function madeMove(row, col){
  var data = {
    "session" : gameID,
    "move" : {
      "player" : player,
      "row" : row,
      "column" : col
    }
  }
  $.ajax({
    url: '/board',
    method: 'POST',
    contentType: "application/json;odata=verbose",
    data: JSON.stringify(data),
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function() {
      getBoard()
    },
    failure: function(){
      console.log('server error. Try again');
    }
  })
}

function testFinish(){
  test_horizontal=function(y,player){
    var found_win=true;
    for(var i=0; i<size; i++){
        if(board[y][i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
  }
  test_vertical=function(x,player){
    var found_win=true;
    for(var i=0; i<size; i++){
        if(board[i][x] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
  }
  test_diagonal_1=function(player){
      var found_win=true;
      for(var i=0; i<size; i++){
        if(board[i][i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
  }
  test_diagonal_2=function(player){
      var found_win=true;
      for(var i=0; i<size; i++){
        if(board[size-i-1][i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
  }
  for(var play=1; play<=2; play++){
    if(test_diagonal_1(play) || test_diagonal_2(play)){
      if(play==player) win();
      else lose();
      play=2;
      break;
    }
    for (var i=0; i < size; i++){
      if(test_horizontal(i, play) || test_vertical(i, play)){
        if(play==player) win();
        else lose();
        i=size;
        play=2;
        break;
      }
    }
  }
}
function endGame(){
  var url="board?session="+gameID;
  $.ajax({
      url: url,
      type: "DELETE",
      success: function(data,textStatus){
         $("#done").html(textStatus);
      }
  })
}
function win(){
  //endGame();
  window.location = "/win";
}
function lose(){
  endGame();
  window.location="/lose";
}
