const defaultChars = [
    { "char": "!", "color": "#CCFFFF", "title": "山巅" },
    { "char": "%", "color": "#FFFFFF", "title": "特殊地点" },
    { "char": ",", "color": "#8C5738", "title": "乡间小路" }, 
    { "char": ".", "color": "#559200", "title": "平地" },
    { "char": "?", "color": "#FFFF00", "title": "区域地点" },
    { "char": "C", "color": "#999900", "title": "玩家建筑" }, 
    { "char": "H", "color": "#573600", "title": "高原" },
    { "char": "R", "color": "#3366FF", "title": "大江" },
    { "char": "V", "color": "#AA0000", "title": "火山" },
    { "char": "b", "color": "#CFC4A5", "title": "沙滩" },
    { "char": "d", "color": "#EEBB22", "title": "沙漠" },
    { "char": "h", "color": "#996600", "title": "丘陵" },
    { "char": "j", "color": "#00AA00", "title": "丛林" },
    { "char": "r", "color": "#6699FF", "title": "河流" },
    { "char": "t", "color": "#00FF00", "title": "苔原" },
    { "char": "w", "color": "#00FFFF", "title": "瀑布" },
    { "char": "y", "color": "#A7CC14", "title": "草原" },
    { "char": "~", "color": "#0000AA", "title": "海洋" },
    { "char": "#", "color": "#4F3645", "title": "建筑" },
    { "char": "+", "color": "#464646", "title": "路口" },
    { "char": "-", "color": "#464646", "title": "路" },
    { "char": "|", "color": "#464646", "title": "路" },
    { "char": "\\", "color": "#464646", "title": "路" },
    { "char": "/", "color": "#464646", "title": "路" },
    { "char": "=", "color": "#484339", "title": "桥" },
    { "char": "$", "color": "#FF0000", "title": "岩浆" },
    { "char": "F", "color": "#008800", "title": "原始森林" },
    { "char": "L", "color": "#FF5000", "title": "岩浆湖" },
    { "char": "S", "color": "#44CCCC", "title": "浅滩" },
    { "char": "^", "color": "#718292", "title": "高山" },
    { "char": "c", "color": "#5F5655", "title": "城镇" },
    { "char": "f", "color": "#00B600", "title": "树林" },
    { "char": "i", "color": "#FFFFFF", "title": "冰" },
    { "char": "l", "color": "#6464FF", "title": "湖泊" },
    { "char": "s", "color": "#9DA80A", "title": "沼泽" },
    { "char": "v", "color": "#22DD22", "title": "山谷" },
    { "char": "x", "color": "#8A8360", "title": "荒原" },
    { "char": "z", "color": "#B1A485", "title": "海岸" },
    { "char": "@", "color": "#FFFFFF", "title": "自己" },
    { "char": "m", "color": "#EE0000", "title": "怪物" }
];
let chars = defaultChars;

const defaultMap = 
`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~SSSSS~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~SSzzzzzzzSSSSS~~~~~~~~~~~~~~~
~~~~~~~~~~~SSzhhfff...zzzzzS~~~~~~~~~~~~~~
~~~~~~~~~~~Shhh^hfff.......zS~~~~~~~~~~~~~
~~~~~~~~~~Shhh^^^hhfff......zS~~~~~~~~~~~~
~~~~~~~~~SShh^^!^^hhffc-----+-c~~~~~~~~~~~
~~~~~~~~~~~Shh^^^hhfff......|.zS~~~~~~~~~~
~~~~~~~~~~~Shh^^^^flfffrrrrr=rrzS~~~~~~~~~
~~~~~~~~~~~SSh^^^hlllrrrff../zSS~~~~~~~~~~
~~~~~~~~~~~SSFh^^hflfffff../.zSS~~~~~~~~~~
~~~~~~~~~~~~SFFh^ffffffc--+zSS~~~~~~~~~~~~
~~~~~~~~~~~~SSFhh.fff.......zzSS~~~~~~~~~~
~~~~~~~~~~~~SSFFh..f.........zzSS~~~~~~~~~
~~~~~~~~~~~~SFFFhh.......?.zzSS~~~~~~~~~~~
~~~~~~~~~~~~~SFFhhh........zS~~~~~~~~~~~~~
~~~~~~~~~~~~~SShhhh~.....zzz~~~~~~~~~~~~~~
~~~~~~~~~~~~~SSShhh.....zzz~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~SShhhhh...zS~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~SSh.hhh.zzS~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~ShhhhhhzzS~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~ShhhhhzSS~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~SShhShSS~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~SSSSSS~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~SS~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`;

const toolbar = document.querySelector('.toolbar');
const resizeHandle = document.querySelector('.resize-handle');
const mapContainer = document.querySelector('.map-container');

let isResizing = false;
let initialWidth = toolbar.offsetWidth;
let initialX = 0; // 记录鼠标按下时的初始X坐标

resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    initialWidth = toolbar.offsetWidth;
    initialX = e.clientX; // 记录鼠标按下时的初始X坐标
});

document.addEventListener('mousemove', (e) => {
  if (isResizing) {
    const deltaX = e.clientX - initialX; // 计算鼠标移动的距离
    const newWidth = initialWidth + deltaX;
    toolbar.style.width = `${newWidth}px`;
    mapContainer.style.width = `calc(100% - ${newWidth}px)`;

    // 重新计算 gridWidth 和 gridHeight
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    gridWidth = Math.floor(containerWidth / fontGridWidth); 
    gridHeight = Math.floor(containerHeight / fontGridHeight); 

    // 重新渲染地图
    renderMap();
  }
});

document.addEventListener('mouseup', () => {
  isResizing = false;
});

//@link https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
function createHiPPICanvas(canvas, width, height) {
    const ratio = window.devicePixelRatio;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(ratio, ratio);

    return canvas;
}

let mapData = [];
let viewX = 0;
let viewY = 0;
let selectedChar = 'X';
let selectedColor = '#000000';
let gridWidth = 50;
let gridHeight = 20;
let xOffset = 10;
let yOffset = 10;
let backgroundColor = '#000000';

let fontGridWidth = 16;
let fontGridHeight = 16;
let fontSize = 18;
let fontFamily = '"Noto Mono", "IBM Plex Mono", "WenQuanYi Micro Hei Mono", monospace';


let mapWidth = 0;
let mapHeight = 0;

// 选区坐标
let startX, startY, endX, endY;
let isDrawing = false;

let isDragging = false; // 是否正在拖动
let dragStartX = 0; // 拖动开始时的X坐标
let dragStartY = 0; // 拖动开始时的Y坐标
let initialViewX = 0; // 拖动开始时的viewX
let initialViewY = 0; // 拖动开始时的viewY


const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

window.onload = function() {
    const mapContainer = document.getElementsByClassName('map-container')[0];
    if (mapContainer) {
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        gridWidth = Math.floor(containerWidth / fontGridWidth); // 每个字符的宽度为16像素
        gridHeight = Math.floor(containerHeight / fontGridHeight); // 每个字符的高度为24像素
    }
    setCharButtons();
};

document.getElementById('loadForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const dataInput = document.getElementById('dataFile');
    const data = dataInput.files[0];
    if (data) {
        const dataReader = new FileReader();
        dataReader.onload = function (event) { 
            const newChars = JSON.parse(event.target.result);
            chars = newChars;
            setCharButtons();
        }
        dataReader.readAsText(data);
    }

    const fileInput = document.getElementById('mapFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            mapData = content.split('\n').map(line => line.split(''));
            mapHeight = mapData.length;
            mapWidth = mapData[0].length;
            startX = parseInt(document.getElementById('startX').value, 10);
            startY = parseInt(document.getElementById('startY').value, 10);
            viewX = startX;
            viewY = startY;
            renderMap();
        };
        reader.readAsText(file);
    } else {
        mapData = defaultMap.split('\n').map(line => line.split(''));
        mapHeight = mapData.length;
        mapWidth = mapData[0].length;
        startX = parseInt(document.getElementById('startX').value, 10);
        startY = parseInt(document.getElementById('startY').value, 10);
        viewX = startX;
        viewY = startY;
        renderMap();
    }
});

function renderMap() {
    createHiPPICanvas(canvas, gridWidth * fontGridWidth, gridHeight * fontGridHeight);
    //canvas.width = gridWidth * fontGridWidth; // 每个字符的宽度为16像素
    //canvas.height = gridHeight * fontGridHeight; // 每个字符的高度为24像素
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor; // 设置背景颜色为黑色
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充背景颜色
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.imageSmoothingEnabled = true; // 启用抗锯齿
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const mapX = viewX + x;
            const mapY = viewY + y;
            if (mapX < mapWidth && mapY < mapHeight && mapData[mapY] && mapData[mapY][mapX]) {
                ctx.fillStyle = getColorForChar(mapData[mapY][mapX]);
                let char = mapData[mapY][mapX];
                ctx.fillText(char, x * fontGridWidth, y * fontGridHeight + fontSize);
            }
        }
    }
    document.getElementById('coords').textContent = `${viewX}, ${viewY}`;
}

const charButtonsDiv = document.querySelector('#char-buttons');
charButtonsDiv.addEventListener('click', function (event) {
    if (event.target.classList.contains('char-button')) {
        selectedChar = event.target.getAttribute('data-char');
    }
});

function setCharButtons() {
    charButtonsDiv.innerHTML = '';
    chars.forEach((char) => {
        const button = document.createElement("button");
        button.classList.add("char-button");
        button.setAttribute("data-char", char.char);
        button.setAttribute("data-color", char.color);
        button.setAttribute("title", char.title);
        button.textContent = char.char;
        charButtonsDiv.appendChild(button);
    });
    setCharButtonsClickEvent();
}

function getColorForChar(char) {
    //const button = document.querySelector(`.char-button[data-char="${char}"]`);
    if (char === "\\") {
        button = document.querySelector(`.char-button[data-char="\\\\"]`);
    } else {
        button = document.querySelector(`.char-button[data-char="${char}"]`);
    }
    return button ? button.getAttribute('data-color') : '#000000';
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Shift') {
        createSelectionCanvas();
        return;
    }
    if (event.key === 'ArrowRight') {
        viewX = Math.min(viewX + xOffset, mapWidth - gridWidth);
    } else if (event.key === 'ArrowLeft') {
        viewX = Math.max(viewX - xOffset, 0);
    } else if (event.key === 'ArrowDown') {
        viewY = Math.min(viewY + yOffset, mapHeight - gridHeight);
    } else if (event.key === 'ArrowUp') {
        viewY = Math.max(viewY - yOffset, 0);
    }
    renderMap();
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'Shift') {
        removeSelectionCanvas();
    }
});

function createSelectionCanvas() {
    selectionCanvas = document.createElement('canvas');

    // 获取 mapCanvas 的父元素
    const parentElement = mapCanvas.parentElement;

    const mapCanvasRect = mapCanvas.getBoundingClientRect();

    // 设置 selectionCanvas 的尺寸与 mapCanvas 一致
    selectionCanvas.width = mapCanvasRect.width;
    selectionCanvas.height = mapCanvasRect.height;

    // 设置 selectionCanvas 的样式
    selectionCanvas.style.position = 'absolute';
    selectionCanvas.style.left = (mapCanvas.offsetLeft) + 'px';
    selectionCanvas.style.top = (mapCanvas.offsetTop) + 'px';
    selectionCanvas.style.zIndex = parseInt(window.getComputedStyle(mapCanvas).zIndex, 10) + 1;

    selectionCtx = selectionCanvas.getContext('2d');

    // 将 selectionCanvas 添加到 mapCanvas 的父元素中
    parentElement.appendChild(selectionCanvas);

    selectionCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    });

    selectionCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        endX = e.offsetX;
        endY = e.offsetY;
        drawSelectionBox();
    });

    selectionCanvas.addEventListener('mouseup', (e) => {
        isDrawing = false;
        endX = e.offsetX;
        endY = e.offsetY;
        replaceSelectedChars();
    });
}

function removeSelectionCanvas() {
    if (selectionCanvas) {
        selectionCanvas.remove();
        selectionCanvas = null;
        selectionCtx = null;
    }
}

function drawSelectionBox() {
    if (!selectionCtx) return;
    selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    selectionCtx.strokeStyle = 'blue';
    selectionCtx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function replaceSelectedChars() {
    // 确保 startX 和 startY 总是小于 endX 和 endY
    const startMapX = Math.min(Math.floor(startX / fontGridWidth) + viewX, Math.floor(endX / fontGridWidth) + viewX);
    const startMapY = Math.min(Math.floor(startY / fontGridHeight) + viewY, Math.floor(endY / fontGridHeight) + viewY);
    const endMapX = Math.max(Math.floor(startX / fontGridWidth) + viewX, Math.floor(endX / fontGridWidth) + viewX);
    const endMapY = Math.max(Math.floor(startY / fontGridHeight) + viewY, Math.floor(endY / fontGridHeight) + viewY);

    for (let y = startMapY; y <= endMapY; y++) {
        for (let x = startMapX; x <= endMapX; x++) {
            if (x < mapWidth && y < mapHeight && mapData[y] && mapData[y][x]) {
                mapData[y][x] = selectedChar;
            }
        }
    }
    renderMap();
}

canvas.addEventListener('mousemove', function (event) {

    if (isDragging) {
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;
        viewX = initialViewX - Math.floor(deltaX / fontGridWidth); // 16是每个字符的宽度
        viewY = initialViewY - Math.floor(deltaY / fontGridHeight); // 24是每个字符的高度
        renderMap();
    } else {

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / fontGridWidth);
        const y = Math.floor((event.clientY - rect.top) / fontGridHeight);
        const mapX = viewX + x;
        const mapY = viewY + y;
        document.getElementById('mouse-coords').textContent = `${mapX}, ${mapY}`;

        if (event.ctrlKey) {
            if (mapX < mapWidth && mapY < mapHeight && mapData[mapY] && mapData[mapY][mapX]) {
                mapData[mapY][mapX] = selectedChar;
                renderMap();
            }
        }
    }
});

canvas.addEventListener('mousedown', function (event) {
    if (event.altKey) {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        initialViewX = viewX;
        initialViewY = viewY;
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / fontGridWidth);
    const y = Math.floor((event.clientY - rect.top) / fontGridHeight);
    const mapX = viewX + x;
    const mapY = viewY + y;

    if (mapX >= mapWidth || mapY >= mapHeight || !mapData[mapY] || !mapData[mapY][mapX]) {
        console.error('Invalid map coordinates:', mapX, mapY);
        return;
    }

    if (event.button === 0) { // 左键点击
        mapData[mapY][mapX] = selectedChar;
        renderMap();
    }
});


canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('wheel', function(event) {
    event.preventDefault(); // 阻止默认的滚动行为

    // 根据滚轮滚动的方向调整 viewY 的值
    if (event.deltaY > 0) {
        // 向下滚动
        viewY = Math.min(viewY + yOffset, mapHeight - gridHeight);
    } else {
        // 向上滚动
        viewY = Math.max(viewY - yOffset, 0);
    }

    // 重新渲染地图
    renderMap();
});


document.getElementById('moveUp').addEventListener('click', function () {
    viewY = Math.max(viewY - 1, 0);
    renderMap();
});

document.getElementById('moveDown').addEventListener('click', function () {
    viewY = Math.min(viewY + 1, mapHeight - 1);
    renderMap();
});

document.getElementById('moveLeft').addEventListener('click', function () {
    viewX = Math.max(viewX - 1, 0);
    renderMap();
});

document.getElementById('moveRight').addEventListener('click', function () {
    viewX = Math.min(viewX + 1, mapWidth - 1);
    renderMap();
});


document.querySelectorAll('.char-button').forEach(button => {
    button.addEventListener('click', function () {
        // 获取当前点击按钮的属性和值
        selectedChar = button.getAttribute('data-char');
        selectedColor = button.getAttribute('data-color');
    });
});

function setCharButtonsClickEvent() {
    document.querySelectorAll('.char-button').forEach(button => {
        button.addEventListener('click', function () {
            // 移除所有按钮的高亮样式
            document.querySelectorAll('.char-button').forEach(btn => {
                btn.style.backgroundColor = '';
            });
            // 获取当前点击按钮的属性和值
            selectedChar = button.getAttribute('data-char');
            selectedColor = button.getAttribute('data-color');
            // 为当前点击的按钮添加高亮样式
            button.style.backgroundColor = selectedColor;
        });
    });
}


document.getElementById('exportButton').addEventListener('click', function () {
    const exportedData = mapData.map(line => line.join('')).join('\n');
    const blob = new Blob([exportedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_map.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('changeBgColor').addEventListener('click', function() {
    // 弹出一个调色盘
    const newColor = prompt('选择背景颜色', backgroundColor);
    if (newColor) {
        // 更新背景颜色变量
        backgroundColor = newColor;
        // 重新渲染地图
        renderMap();
    }
});

document.getElementById('clearLoadForm').addEventListener('click', function() {
    var dataFileInput = document.getElementById('dataFile');
    dataFileInput.value = ''; // 清除文件输入框的值
    var mapFileInput = document.getElementById('mapFile');
    mapFileInput.value = ''; // 清除文件输入框的值
    chars = defaultChars;
    setCharButtons();
});
