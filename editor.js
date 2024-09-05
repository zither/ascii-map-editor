const defaultChars = [
    { char: "#", color: "#777777", title: "建筑" },
    { char: "%", color: "#FFFFFF", title: "特殊地点" },
    { char: ",", color: "#777777", title: "乡间小路" },
    { char: ".", color: "#00AA00", title: "平地" },
    { char: "?", color: "#FFFF00", title: "区域地点" },
    { char: "C", color: "#777777", title: "玩家建筑" },
    { char: "H", color: "#770077", title: "高原" },
    { char: "R", color: "#0000AA", title: "大江" },
    { char: "V", color: "#AA0000", title: "火山" },
    { char: "b", color: "#AAAA00", title: "沙滩" },
    { char: "d", color: "#AAAA00", title: "沙漠" },
    { char: "h", color: "#770077", title: "丘陵" },
    { char: "j", color: "#00AA00", title: "丛林" },
    { char: "r", color: "#0000FF", title: "河流" },
    { char: "t", color: "#00FF00", title: "苔原" },
    { char: "w", color: "#00FFFF", title: "瀑布" },
    { char: "y", color: "#AAAA00", title: "草原" },
    { char: "~", color: "#0000AA", title: "海洋" },
    { char: "+", color: "#777777", title: "路口" },
    { char: "-", color: "#777777", title: "路" },
    { char: "|", color: "#777777", title: "路" },
    { char: "\\", color: "#777777", title: "路" },
    { char: "/", color: "#777777", title: "路" },
    { char: "=", color: "#777777", title: "桥" },
    { char: "$", color: "#FF0000", title: "岩浆" },
    { char: "F", color: "#00AA00", title: "原始森林" },
    { char: "L", color: "#FF0000", title: "岩浆湖" },
    { char: "S", color: "#00FFFF", title: "浅滩" },
    { char: "^", color: "#FF00FF", title: "高山" },
    { char: "c", color: "#777777", title: "城镇" },
    { char: "f", color: "#00FF00", title: "树林" },
    { char: "i", color: "#FFFFFF", title: "冰" },
    { char: "l", color: "#0000FF", title: "湖泊" },
    { char: "s", color: "#EE0000", title: "沼泽" },
    { char: "v", color: "#00FF00", title: "山谷" },
    { char: "x", color: "#777777", title: "荒原" },
    { char: "z", color: "#FFFF00", title: "海岸" },
    { char: "@", color: "#FFFFFF", title: "自己" },
    { char: "m", color: "#EE0000", title: "怪物" }
];
let chars = defaultChars;

const defaultMap = 
`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~SSSSS~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~SSzzzzzzzSSSSS~~~~~~~~~~~~~~~
~~~~~~~~~~SSzHHfff...zzzzzS~~~~~~~~~~~~~~
~~~~~~~~~~SzHH^Hfff.......zS~~~~~~~~~~~~~
~~~~~~~~~SzzH^^^HHfff......zS~~~~~~~~~~~~
~~~~~~~~SSzH^^!^^HHffc-----+-c~~~~~~~~~~~
~~~~~~~~~~SzH^^HHHfff......|.zS~~~~~~~~~~
~~~~~~~~~~Sz.HHHHflfffrrrrr=rrzS~~~~~~~~~
~~~~~~~~~~SSz..HHlllrrrff../zSS~~~~~~~~~~
~~~~~~~~~~SSzzz.Hflfffff../.zSS~~~~~~~~~~
~~~~~~~~~~~SSz..ffffffc--+zSS~~~~~~~~~~~~
~~~~~~~~~~~~~SSz.fff...,...zzSS~~~~~~~~~~
~~~~~~~~~~~~~~Szz.f.....,...zzSS~~~~~~~~~
~~~~~~~~~~~~~~~SSzzz.....,zzSS~~~~~~~~~~~
~~~~~~~~~~~~~~~~~SSzz....z?S~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~SSz.zSS~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~SSzS~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~S~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`;

const toolbar = document.querySelector('.toolbar');
const resizeHandle = document.querySelector('.resize-handle');
const mapContainer = document.querySelector('.map-container');

let isResizing = false;
let initialWidth = toolbar.offsetWidth;
let initialX = 0; // 记录鼠标按下时的初始X坐标

resizeHandle.addEventListener('mousedown', (e) => {
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
    gridWidth = Math.floor(containerWidth / 16); // 每个字符的宽度为16像素
    gridHeight = Math.floor(containerHeight / 24); // 每个字符的高度为24像素

    // 重新渲染地图
    renderMap();
  }
});

document.addEventListener('mouseup', () => {
  isResizing = false;
});

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
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

let mapWidth = 0;
let mapHeight = 0;

window.onload = function() {
    const mapContainer = document.getElementsByClassName('map-container')[0];
    if (mapContainer) {
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        gridWidth = Math.floor(containerWidth / 16); // 每个字符的宽度为16像素
        gridHeight = Math.floor(containerHeight / 24); // 每个字符的高度为24像素
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
    canvas.width = gridWidth * 16; // 每个字符的宽度为16像素
    canvas.height = gridHeight * 24; // 每个字符的高度为24像素
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor; // 设置背景颜色为黑色
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充背景颜色
    ctx.font = '12px monospace';
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const mapX = viewX + x;
            const mapY = viewY + y;
            if (mapX < mapWidth && mapY < mapHeight && mapData[mapY] && mapData[mapY][mapX]) {
                ctx.fillStyle = getColorForChar(mapData[mapY][mapX]);
                let char = mapData[mapY][mapX];
                ctx.fillText(char, x * 16, y * 24 + 12);
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

canvas.addEventListener('mousemove', function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 16);
    const y = Math.floor((event.clientY - rect.top) / 24);
    const mapX = viewX + x;
    const mapY = viewY + y;
    document.getElementById('mouse-coords').textContent = `${mapX}, ${mapY}`;

    if (event.ctrlKey) {
        if (mapX < mapWidth && mapY < mapHeight && mapData[mapY] && mapData[mapY][mapX]) {
            mapData[mapY][mapX] = selectedChar;
            renderMap();
        }
    }
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

canvas.addEventListener('mousedown', function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 16);
    const y = Math.floor((event.clientY - rect.top) / 24);
    const mapX = viewX + x;
    const mapY = viewY + y;
    console.log(event.button);
    if (mapX < mapWidth && mapY < mapHeight && mapData[mapY] && mapData[mapY][mapX]) {
        if (event.button === 0) { // 左键点击
            mapData[mapY][mapX] = selectedChar;
            renderMap();
        }
    }
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
