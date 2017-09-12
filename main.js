// 尺寸、画布等常量
var SIZE = ~~(screen.availWidth / 9) - 1;
var WRAP_SIZE = (SIZE + 1) * 9 + 1;
var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');
cvs.width = WRAP_SIZE;
cvs.height = WRAP_SIZE;
var ani;
// 背景画布
var bgcvs = document.getElementById('back');
var bgctx = bgcvs.getContext('2d');
bgcvs.width = WRAP_SIZE;
bgcvs.height = WRAP_SIZE;

var kindList = ['f00','0ff','0f0','f0f','00f','ff0','000']; // 颜色列表
var ballList = {}; // 色球列表
var emptyList = []; // 空格列表
var nextList = []; // 下一批颜色列表
var currentBall = null, // 选中球的id
    currentBallX = true; // 选中球的动画状态是否正在缩小
// 画背景
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
// 画球
function drawBallByID (id) {
    var col = id % 10,
        row = ~~(id / 10);
    var obj = ballList[id];
    if (id == currentBall) {
        if (pathOK) { // 移动
            obj.r = SIZE/3;
            if (obj.x == obj.ox && obj.y == obj.oy) {
                if (pathArr.length > 0) {
                    var next = pathArr.pop();
                    obj.ox = getTopLeft(next.x) + SIZE/2;
                    obj.oy = getTopLeft(next.y) + SIZE/2;
                    obj.dtx = obj.ox - obj.x;
                    obj.dty = obj.oy - obj.y;
                } else {
                    pathOK = false;
                    setBlock(obj.id, obj.n);
                    ballList[obj.id].r = obj.r;
                    emptyList.push(parseInt(id));
                    ballList[id] = {n: null};
                    clearDate();
                    checkClear(obj.id);
                }
            } else {
                obj.x = obj.dtx > 0 ?
                    Math.min(obj.ox, obj.x + 4) :
                    Math.max(obj.ox, obj.x - 4);
                obj.y = obj.dty > 0 ?
                    Math.min(obj.oy, obj.y + 4) :
                    Math.max(obj.oy, obj.y - 4);
            }
        } else { // 缩放
            if (currentBallX) {
                obj.r -= .5;
                if (obj.r < SIZE/6) {
                    currentBallX = false;
                }
            } else {
                obj.r += .5;
                if (obj.r > SIZE*2/5) {
                    currentBallX = true;
                }
            }
        }
    } else {
        obj.r = Math.min(SIZE/3, obj.r+2);
    }
    ctx.fillStyle = '#' + kindList[obj.n];
    ctx.beginPath();
    ctx.arc(
        obj.x || getTopLeft(col) + SIZE/2,
        obj.y || getTopLeft(row) + SIZE/2,
        obj.r, 0, Math.PI*2
    );
    ctx.closePath();
    ctx.fill();
}
var clearList = [];
function checkClear (id) {
    var obj = ballList[id],
        xy = getXY(id);
    var dirs = [[0,-1], [1,1], [1,0], [1,-1]];
    for (var d = 0; d < 4; d++) {
        var arr = [];
        for (var r = 1, i = 1; r >= -1; r -= 2, i = 1) {
            while (true) {
                var next = {x: xy.x + dirs[d][0]*r*i, y: xy.y + dirs[d][1]*r*i};
                var xid = getID(next.x, next.y);
                if (next.x < 0 || next.x > 8 || next.y < 0 || next.y > 8) {
                    break;
                }
                if (obj.n == ballList[xid].n) {
                    arr.push(xid);
                    i++;
                } else {
                    break;
                }
            }
        }
        if (arr.length >= 4) {
            clearList = clearList.concat(arr);
        }
    }
    // 执行消除
    console.log(clearList)
    if (clearList.length > 0) {
        clearList.forEach(function (i) {
            setBlock(id, null);
            setBlock(i, null);
        })
        clearList = [];
    } else {
        new3Ball();
    }
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
    } else {
        emptyList.push(id);
    }
}
var pathList = {};
var searchList = []
    nextSearchList = [];
var objectXY = {};
var countStep = 0;
function clearDate () {
    countStep = 0;
    currentBall = null;
    objectXY = {};
    searchList = [];
    nextSearchList = [];
    pathList = {};
}
function searchAround () {
    for (var i = 0, len = searchList.length; i < len; i++) {
        var b = searchList[i];
        if (b.x == objectXY.x && b.y == objectXY.y) {
            ballList[currentBall].id = getID(objectXY.x, objectXY.y);
            console.log('找到:'+countStep);
            getReturnPath();
            return false;
        }
        addAroundList(b);
    }
    if (nextSearchList.length > 0) {
        countStep++;
        searchList = nextSearchList;
        nextSearchList = [];
        searchAround();
    } else {
        console.log('找不到');
        clearDate();
    }
}
function addAroundList (b) {
    [[0,-1], [1,0], [0,1], [-1,0]].forEach(function (xo) {
        var next = {x: b.x + xo[0], y: b.y + xo[1]};
        var nextID = getID(next.x, next.y);
        if (next.x < 0 || next.x > 8 || next.y < 0 || next.y > 8) {
            return false;
        }
        if (emptyList.indexOf(nextID) < 0) {
            return false;
        }
        if (!pathList[nextID]) {
            pathList[nextID] = countStep+1;
            nextSearchList.push({x: b.x + xo[0], y: b.y + xo[1]});
        }
    });
}
var pathArr = [],
    pathOK = false;
function getReturnPath () {
    var goon = true;
    [[0,-1], [1,0], [0,1], [-1,0]].forEach(function (xo) {
        var next = {x: objectXY.x + xo[0], y: objectXY.y + xo[1]};
        var nextID = getID(next.x, next.y)
        if (next.x < 0 || next.x > 8 || next.y < 0 || next.y > 8) {
            return false;
        }
        if (goon && pathList[nextID] == countStep-1) {
            pathArr.push(objectXY);
            objectXY = next;
            goon = false;
        }
    });
    if (countStep == 1) {
        console.log('回归路线：'+JSON.stringify(pathArr))
        pathOK = true;
        // pathArr = [];
    } else {
        countStep--;
        getReturnPath();
    }
}
function userPlay () {
    cvs.addEventListener('touchstart', function (e) {
        var x = ~~(e.touches[0].clientX / (SIZE+1)),
            y = ~~(e.touches[0].clientY / (SIZE+1));
        var id = getID(x, y);
        if (ballList[id].n != null) {
            currentBall = id;
            searchList.push(getXY(id));
            pathList[id] = 0;
            ballList[id].x = getTopLeft(x) + SIZE/2;
            ballList[id].y = getTopLeft(y) + SIZE/2;
            ballList[id].ox = ballList[id].x;
            ballList[id].oy = ballList[id].y;
        } else if (currentBall != null) {
            objectXY = getXY(id);
            searchAround();
            // currentBall = null;
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