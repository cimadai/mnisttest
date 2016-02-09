/*global $*/
"use strict";

class Main {
    constructor() {
        this.canvas = document.getElementById('main');
        this.input = document.getElementById('input');
        this.canvas.width  = 449; // 16 * 28 + 1
        this.canvas.height = 449; // 16 * 28 + 1
        this.ctx = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup',   this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.initialize();
    }
    initialize() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, 449, 449);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, 449, 449);
        this.ctx.lineWidth = 0.05;
        for (var i = 0; i < 27; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo((i + 1) * 16,   0);
            this.ctx.lineTo((i + 1) * 16, 449);
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(  0, (i + 1) * 16);
            this.ctx.lineTo(449, (i + 1) * 16);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.drawInput();
        $('#output td').text('').removeClass('success');
    }
    onMouseDown(e) {
        this.canvas.style.cursor = 'default';
        this.drawing = true;
        this.prev = this.getPosition(e.clientX, e.clientY);
    }
    onMouseUp() {
        this.drawing = false;
        this.drawInput();
    }
    onMouseMove(e) {
        if (this.drawing) {
            var curr = this.getPosition(e.clientX, e.clientY);
            this.ctx.lineWidth = 16;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.prev.x, this.prev.y);
            this.ctx.lineTo(curr.x, curr.y);
            this.ctx.stroke();
            this.ctx.closePath();
            this.prev = curr;
        }
    }
    getPosition(clientX, clientY) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    simpleRgbToGray(r, g, b) {
        return (r + g + b) / 3;
    }
    ntscCoefRgbToGray(r, g, b) {
        return r * 0.3 + g * 0.59 + b * 0.11;
    }
    drawInput() {
        var ctx = this.input.getContext('2d');
        var img = new Image();
        img.onload = () => {
            var inputs = [];
            var small = document.createElement('canvas').getContext('2d');
            small.drawImage(img, 0, 0, img.width, img.height, 0, 0, 28, 28);
            var data = small.getImageData(0, 0, 28, 28).data;
            for (var i = 0; i < 28; i++) {
                for (var j = 0; j < 28; j++) {
                    var n = 4 * (i * 28 + j);
                    // グレイスケール化 (NTSC系加重平均法)
                    inputs[i * 28 + j] = 255 - this.ntscCoefRgbToGray(data[n], data[n + 1], data[n + 2]);

                    // グレイスケール化 (単純平均)
                    // inputs[i * 28 + j] = this.simpleRgbToGray(data[n], data[n + 1], data[n + 2])

                    ctx.fillStyle = 'rgb(' + [data[n], data[n + 1], data[n + 2]].join(',') + ')';
                    ctx.fillRect(j * 5, i * 5, 5, 5);
                }
            }
            if (Math.max(...inputs) === 0) {
                return;
            }
            $.ajax({
                url: "/detect",
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(inputs),
                success: (data) => {
                    // 785: 0
                    // 786: 1
                    // 787: 2
                    // 787: 3
                    // 789: 4
                    // 790: 5
                    // 791: 6
                    // 792: 7
                    // 793: 8
                    // 794: 9
                    // 795: maybe
                    var $trs = $('#output').find("tr");
                    var values = data.Results.output1.value.Values[0];
                    var max = 0;
                    var max_index = 0;
                    for (var i = 0; i < 10; i++) {
                        var idx = i + 785;
                        var value = Math.round(values[idx] * 1000);

                        if (value > max) {
                            max = value;
                            max_index = i;
                        }

                        var digits = String(value).length;
                        for (var k = 0; k < 3 - digits; k++) {
                            value = '0' + value;
                        }
                        var text = '0.' + value;
                        if (value > 999) {
                            text = '1.000';
                        }
                        $trs.eq(i + 1).find("td").text(text);
                    }
                    $trs.find("td").removeClass("success");
                    $trs.eq(max_index + 1).find("td").addClass("success");
                }
            });
        };
        img.src = this.canvas.toDataURL();
    }
}

$(() => {
    var main = new Main();
    $('#clear').click(() => {
        main.initialize();
    });
});
