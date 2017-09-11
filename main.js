var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');
var WRAP_SIZE = 298;
var SIZE = 32;
cvs.width = WRAP_SIZE;
cvs.height = WRAP_SIZE;

function drawBack () {
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            ctx.fillRect(j+1 + SIZE*j, i+1 + SIZE*i, SIZE, SIZE);
        }
    }
    ctx.closePath();
    ctx.fill();
}
drawBack();