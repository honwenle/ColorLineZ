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
bgcvs.height = WRAP_SIZE + SIZE;

var kindList = ['f00','0ff','0f0','f0f','00f','ff0','000']; // 颜色列表
var ballList = {}; // 色球列表
var nextList = []; // 下一批颜色列表
var currentBall = null, // 选中球的id
    currentBallX = true; // 选中球的动画状态是否正在缩小
var canplay = false;
var score = 0;
var noClearToOver = false;
var gameover = false;
// 画背景
function drawBack () {
    bgctx.fillStyle = '#bbb';
    bgctx.beginPath();
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            bgctx.fillRect(getTopLeft(j), getTopLeft(i), SIZE, SIZE);
            ballList[getID(j, i)] = {n: null};
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
                    ballList[id] = {n: null};
                    clearDate();
                    checkClear(obj.id, true);
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
// 检查消除
function checkClear (id, needNew) {
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
    // console.log('消除：'+JSON.stringify(clearList))
    if (clearList.length > 0) {
        score += Math.pow(2, clearList.length - 4);
        clearList.forEach(function (i) {
            setBlock(id, null);
            setBlock(i, null);
        })
        clearList = [];
        drawScore();
        noClearToOver = false;
    } else if (needNew) {
        new3Ball();
    } else if (noClearToOver) {
        console.log('获得'+score+'分')
        gameover = true;
        updateHighScore();
        // location.reload();
        return false;
    }
}
function drawScore () {
    bgctx.clearRect(SIZE*5, WRAP_SIZE, SIZE*4, SIZE);
    bgctx.fillText('得分：' + score, SIZE*5, WRAP_SIZE + SIZE/2);
    saveGame();
}
function getTopLeft (n) {
    return (SIZE + 1) * n + 1;
}
function randomColor () {
    return ~~(Math.random() * 7);
}
// 生成 绘制下一组
function next3Ball () {
    var isSave = nextList.length > 0;
    for (var i = 0; i < 3; i++) {
        var cl = isSave ? nextList[i] : randomColor();
        isSave || nextList.push(cl);
        bgctx.beginPath();
        bgctx.fillStyle = '#' + kindList[cl];
        bgctx.arc(SIZE*5/2 + i * SIZE, WRAP_SIZE + SIZE/2, SIZE/3, 0, Math.PI*2);
        bgctx.closePath();
        bgctx.fill();
    }
    bgctx.font = SIZE/2 + 'px 微软雅黑';
    bgctx.fillStyle = '#fff';
    bgctx.textBaseline = 'middle';
    bgctx.fillText('下一组：', 0, WRAP_SIZE + SIZE/2);
}
// 放置新球
function newBall () {
    var emptyList = [];
    for (var id in ballList) {
        if (ballList[id].n == null) {
            emptyList.push(id);
        }
    }
    if (emptyList.length == 1) {
        noClearToOver = true;
    }
    if (emptyList.length > 0) {
        var id = emptyList[~~(Math.random() * emptyList.length)];
        setBlock(id, nextList.shift());
        checkClear(id, false);
    } else {
        console.log('没地加了')
    }
}
function new3Ball () {
    for (var i = 0; i < 3; i++) {
        newBall();
    }
    canplay = true;
    next3Ball();
    saveGame();
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
}
var pathList = {};
var searchList = []
    nextSearchList = [];
var objectXY = {};
var countStep = 0;
// 重置数据
function clearDate () {
    countStep = 0;
    currentBall = null;
    objectXY = {};
    searchList = [];
    nextSearchList = [];
    pathList = {};
    canplay = true;
}
// 以出发点为第一组搜索列表向外延伸搜索
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
    // console.log('下一轮寻找'+JSON.stringify(nextSearchList))
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
// 将周围4格为查询的空格添加到查询列表
function addAroundList (b) {
    [[0,-1], [1,0], [0,1], [-1,0]].forEach(function (xo) {
        var next = {x: b.x + xo[0], y: b.y + xo[1]};
        var nextID = getID(next.x, next.y);
        if (next.x < 0 || next.x > 8 || next.y < 0 || next.y > 8) {
            return false;
        }
        if (ballList[nextID].n != null) {
            return false;
        }
        if (!pathList[nextID]) {
            pathList[nextID] = countStep+1;
            nextSearchList.push(next);
        }
    });
}
var pathArr = [],
    pathOK = false;
// 寻找回归路径
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
        // console.log('回归路线：'+JSON.stringify(pathArr))
        pathOK = true;
    } else {
        countStep--;
        getReturnPath();
    }
}
// 选中出发点
function selectBall (id, x, y) {
    if (currentBall) {
        pathList = {};
        ballList[id].x = undefined;
        ballList[id].y = undefined;
    }
    currentBall = id;
    searchList = [getXY(id)];
    pathList[id] = 0;
    ballList[id].x = getTopLeft(x) + SIZE/2;
    ballList[id].y = getTopLeft(y) + SIZE/2;
    ballList[id].ox = ballList[id].x;
    ballList[id].oy = ballList[id].y;
}
// 用户输入
function userPlay () {
    cvs.addEventListener('touchstart', function (e) {
        if (!canplay || gameover) {
            return false;
        }
        var x = ~~(e.touches[0].clientX / (SIZE+1)),
            y = ~~(e.touches[0].clientY / (SIZE+1));
        var id = getID(x, y);
        if (ballList[id].n != null) {
            selectBall(id, x, y);
        } else if (currentBall != null) {
            canplay = false;
            objectXY = getXY(id);
            searchAround();
        }
    });
}
// 渲染画布
function renderBall () {
    ctx.clearRect(0, 0, WRAP_SIZE, WRAP_SIZE);
    for (var i in ballList) {
        if (ballList[i].n != null) {
            drawBallByID(i);
        }
    }
    ani = requestAnimationFrame(renderBall);
}
// 恢复棋盘
function restoreGame () {
    var _ballList = JSON.parse(localStorage.getItem('cl_ball'));
    var _nextList = JSON.parse(localStorage.getItem('cl_next'));
    _ballList && (ballList = _ballList);
    _nextList && (nextList = _nextList);
    score = (localStorage.getItem('cl_score') || 0) | 0;
    document.getElementById('high').innerHTML = localStorage.getItem('cl_high');
    return !_ballList;
}
// 保存棋盘
function saveGame () {
    localStorage.setItem('cl_ball', JSON.stringify(ballList));
    localStorage.setItem('cl_next', JSON.stringify(nextList));
    localStorage.setItem('cl_score', score);
}
// 清除保存
function clearSave () {
    localStorage.removeItem('cl_ball');
    localStorage.removeItem('cl_next');
    localStorage.removeItem('cl_score');
}
// 更新最高分
function updateHighScore () {
    var high = localStorage.getItem('cl_high');
    if (score > high) {
        localStorage.setItem('cl_high', score);
    }
    clearSave();
}
// 初始化
function init () {
    drawBack();
    userPlay();
    if (restoreGame()) {
        next3Ball();
        new3Ball();
    } else {
        next3Ball();
        canplay = true;
    }
    drawScore();
    renderBall();
}
init();