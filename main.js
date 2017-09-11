var SIZE = ~~(screen.availWidth / 9) - 1;
var WRAP_SIZE = (SIZE + 1) * 9 + 1;
var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');
cvs.width = WRAP_SIZE;
cvs.height = WRAP_SIZE;

var bgcvs = document.getElementById('back');
var bgctx = bgcvs.getContext('2d');
bgcvs.width = WRAP_SIZE;
bgcvs.height = WRAP_SIZE;

var kindList = ['f00','0ff','0f0','f0f','00f','ff0','000'];
var ballList = {};
var emptyList = [];
var nextList = [];
var currentBall = null;

function drawBack () {
    bgctx.fillStyle = '#bbb';
    bgctx.beginPath();
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            bgctx.fillRect(getTopLeft(j), getTopLeft(i), SIZE, SIZE);
            ballList[getID(j, i)] = {n: null};
            emptyList.push(getID(j, i));
        }
    }
    bgctx.closePath();
    bgctx.fill();
}
function drawBall (col, row, n) {
    ctx.fillStyle = '#' + kindList[n];
    ctx.beginPath();
    ctx.arc(getTopLeft(col) + SIZE/2, getTopLeft(row) + SIZE/2, SIZE/3, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
}
function drawBallByID (id) {
    var col = id % 10,
        row = ~~(id / 10),
        n = ballList[id].n;
    drawBall(col, row, n);
}
function getTopLeft (n) {
    return (SIZE + 1) * n + 1;
}
function randomColor () {
    return ~~(Math.random() * 7);
}
function next3Ball () {
    nextList = [];
    for (var i = 0; i < 3; i++) {
        nextList.push(randomColor());
    }
}
function newBall () {
    if (emptyList.length > 0) {
        var id = emptyList[~~(Math.random() * emptyList.length)];
        setBlock(id, nextList.shift());
    } else {
        console.log('没地加了')
    }
}
function new3Ball () {
    for (var i = 0; i < 3; i++) {
        newBall();
    }
    renderBall();
    next3Ball();
}
function getID (col, row) {
    return row * 10 + col;
}
function setBlock (id, n) {
    ballList[id] = {
        n: n
    }
    if (n != null) {
        emptyList.splice(emptyList.indexOf(id), 1);
    }
}
function userPlay () {
    cvs.addEventListener('touchstart', function (e) {
        var x = ~~(e.touches[0].clientX / (SIZE+1)),
            y = ~~(e.touches[0].clientY / (SIZE+1));
        var id = getID(x, y);
        if (ballList[id].n != null) {
            currentBall = id;
        } else if (currentBall) {
            // moveBall
            new3Ball();
            currentBall = null;
        }
    });
}
function renderBall () {
    ctx.clearRect(0, 0, WRAP_SIZE, WRAP_SIZE);
    for (var i in ballList) {
        if (ballList[i].n != null) {
            drawBallByID(i);
        }
    }
}

function init () {
    drawBack();
    userPlay();
    next3Ball();
    new3Ball();
}
init();