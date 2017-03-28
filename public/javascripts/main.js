var board
var gameID
var name
var turn
var player


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

  if (name == '' || gameID == '') {
    $('#alert').html('<div class="alert alert-warning">Name and game ID cannot be left blank.</div>');
    return
  }

  if ($('#newGame').is(':checked')) {
    var data = {
      "session" : gameID,
      "player1" : name,
      "size" : 3,
      "turn": 1,
      "board": [[0,0,0],[0,0,0],[0,0,0]]
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
  /*for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j] == 1) {
        $('#' + (j+1).toString() + (i+1).toString() + ' .circle').css('background', 'red')
      }
      if (board[i][j] == 2) {
        $('#' + (j+1).toString() + (i+1).toString() + ' .circle').css('background', 'black')
      }
    }
  }*/
  $('#turn').text((turn==1? json.player1 : json.player2)+"\'s Turn");
  $('#prompt').text(((turn==player)? "It's your turn. Go ahead and move!":"It's not your turn. You're going to have to wait for the other player."));
  testFinish();
}

function runPage() {
  turn = 1
  $('.col1').click(function() {
    if (turn == player && board[0].length < 6)
    {
      dropPiece(0)
      madeMove(0)
    }
    if (turn == player && board[0].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col2').click(function() {
    if (turn == player && board[1].length < 6)
    {
      dropPiece(1)
      madeMove(1)
    }
    if (turn == player && board[1].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col3').click(function() {
    if (turn == player && board[2].length < 6)
    {
      dropPiece(2)
      madeMove(2)
    }
    if (turn == player && board[2].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col4').click(function() {
    if (turn == player && board[3].length < 6)
    {
      dropPiece(3)
      madeMove(3)
    }
    if (turn == player && board[3].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col5').click(function() {
    if (turn == player && board[4].length < 6)
    {
      dropPiece(4)
      madeMove(4)
    }
    if (turn == player && board[4].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col6').click(function() {
    if (turn == player && board[5].length < 6)
    {
      dropPiece(5)
      madeMove(5)
    }
    if (turn == player && board[5].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
  $('.col7').click(function() {
    if (turn == player && board[6].length < 6)
    {
      dropPiece(6)
      madeMove(6)
    }
    if (turn == player && board[6].length == 6)
    {
      $('#prompt').text('Column is full. Try a different column.')
    }
  })
}

function dropPiece(col) {}

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
  test_horizontal=function(x,y,player){
    if(x<4){
      var found_win=true;
      for(var i=x; i<x+4; i++){
        if(board[i][y] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
    } else return false;
  }
  test_vertical=function(x,y,player){
    if(y<3){
      var found_win=true;
      for(var i=y; i<y+4; i++){
        if(board[x][i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
    } else return false;
  }
  test_diagonal_1=function(x,y,player){
    if(x<4 && y<3){
      var found_win=true;
      for(var i=0; i<4; i++){
        if(board[x+i][y+i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
    } else return false;
  }
  test_diagonal_2=function(x,y,player){
    if(x>2 && y<3){
      var found_win=true;
      for(var i=0; i<4; i++){
        if(board[x-i][y+i] != player){
          found_win=false;
          break;
        }
      }
    return found_win;
    } else return false;
  }
  for(var play=1; play<=2; play++){
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        console.log("testing ("+i.toString()+","+j.toString()+")");
        if(test_horizontal(i,j,play) || test_vertical(i,j,play) || test_diagonal_1(i,j,play) || test_diagonal_2(i,j,play)){
          if(play==player) win();
          else lose();
          j=board[i].length;
          i=board.length;
          play=1;
          break;
        }
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
