var SIZE = ~~(screen.availWidth / 9) - 1;
var WRAP_SIZE = (SIZE + 1) * 9 + 1;
var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');
cvs.width = WRAP_SIZE;
cvs.height = WRAP_SIZE;
var ani;

var bgcvs = document.getElementById('back');
var bgctx = bgcvs.getContext('2d');
bgcvs.width = WRAP_SIZE;
bgcvs.height = WRAP_SIZE;

var kindList = ['f00','0ff','0f0','f0f','00f','ff0','000'];
var ballList = {};
var emptyList = [];
var nextList = [];
var currentBall = null,
    currentBallX = true;

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
function drawBall (col, row, n, r) {
    ctx.fillStyle = '#' + kindList[n];
    ctx.beginPath();
    ctx.arc(getTopLeft(col) + SIZE/2, getTopLeft(row) + SIZE/2, r, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
}
function drawBallByID (id) {
    var col = id % 10,
        row = ~~(id / 10),
        n = ballList[id].n;
    if (id == currentBall) {
        if (currentBallX) {
            ballList[id].r -= .5;
            if (ballList[id].r < SIZE/6) {
                currentBallX = false;
            }
        } else {
            ballList[id].r += .5;
            if (ballList[id].r > SIZE*2/5) {
                currentBallX = true;
            }
        }
    } else {
        ballList[id].r = Math.min(SIZE/3, ballList[id].r+2);
    }
    drawBall(col, row, n, ballList[id].r);
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
    next3Ball();
}
function getID (col, row) {
    return row * 10 + col;
}
function getXY (id) {
    return {
        x: id % 10,
        y: ~~(id / 10)
    }
}
function setBlock (id, n) {
    ballList[id] = {
        n: n,
        r: 0
    }
    if (n != null) {
        emptyList.splice(emptyList.indexOf(id), 1);
    }
}
var pathList = {};
var searchList = []
    nextSearchList = [];
var objectXY = {};
var countStep = 0;
function searchAround () {
    var goon = true;
    searchList.forEach(function (b) {
        if (b.x == objectXY.x && b.y == objectXY.y) {
            console.log('找到:'+countStep);
            countStep = 0;
            objectXY = {};
            searchList = [];
            nextSearchList = [];
            pathList = {};
            goon = false;
        } else {
            goon && addAroundList(b);
        }
    });
    if (goon) {
        countStep++;
        searchList = nextSearchList;
        searchAround();
    }
}
function addAroundList (b) {
    [[0,-1], [1,0], [0,1], [-1,0]].forEach(function (xo) {
        var next = {x: b.x + xo[0], y: b.y + xo[1]};
        var nextID = getID(next.x, next.y)
        if (next.x < 0 || next.x > 8 || next.y < 0 || next.y > 8) {
            return false;
        }
        if (emptyList.indexOf(nextID) < 0) {
            return false;
        }
        if (!pathList[nextID]) {
            pathList[nextID] = countStep;
            nextSearchList.push({x: b.x + xo[0], y: b.y + xo[1]});
        }
    });
}
function getReturnPath () {}
function userPlay () {
    cvs.addEventListener('touchstart', function (e) {
        var x = ~~(e.touches[0].clientX / (SIZE+1)),
            y = ~~(e.touches[0].clientY / (SIZE+1));
        var id = getID(x, y);
        if (ballList[id].n != null) {
            currentBall = id;
            searchList.push(getXY(id))
        } else if (currentBall) {
            objectXY = {x: x, y: y};
            searchAround();
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
    ani = requestAnimationFrame(renderBall);
}

function init () {
    drawBack();
    userPlay();
    next3Ball();
    new3Ball();
    renderBall();
}
init();