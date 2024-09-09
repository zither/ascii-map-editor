<?php

class TileGenerator 
{
    private $tileSize = 256;
    private $defaultChar = '~';
    private $defaultCharColor = '#0000AA';
    private $width;
    private $height;
    private $map = [];
    private $chars = [];
    private $colors = [];
    private $minFontSize = 8;
    private $cellSize = 16;
    
    public function __construct(string $mapFilePath)
    {
        // 读取ASCII地图文件内容
        $asciiMap = file_get_contents($mapFilePath);
        if ($asciiMap === false) {
            throw new Exception("Failed to read ASCII map file.");
        }

        // 将ASCII地图数据按行分割
        $this->map = explode("\n", $asciiMap);

        // 获取地图的宽度和高度
        $this->width = strlen($this->map[0]);
        $this->height = count($this->map);

        // 读取chars.json文件内容
        $charsJson = file_get_contents(__DIR__ . '/../examples/chars.json');
        if ($charsJson === false) {
            throw new Exception("Failed to read chars.json file.");
        }
        $this->chars = json_decode($charsJson, true);

        // 定义颜色映射
        foreach ($this->chars as $charDef) {
            $this->colors[$charDef['char']] = $this->transColor($charDef['color']);
        }
    }

    public function generateTiles(int $zoomLevel, $cellSize = 16) 
    {
        if (!file_exists(__DIR__ . "/../tiles/{$zoomLevel}")) {
            mkdir(__DIR__ . "/../tiles/{$zoomLevel}", 0777, true);
        }
        // 计算需要生成的Tile数量
        $numTilesX = ceil($this->width / ($this->tileSize / $cellSize));
        $numTilesY = ceil($this->height / ($this->tileSize / $cellSize));

        $this->cellSize = $cellSize;

        // 遍历每个Tile
        for ($tileY = 0; $tileY < $numTilesY; $tileY++) {
            for ($tileX = 0; $tileX < $numTilesX; $tileX++) {
                // 创建一个空白图像
                $image = imagecreatetruecolor($this->tileSize, $this->tileSize);

                // 遍历Tile内的每个格子
                for ($cellY = 0; $cellY < ($this->tileSize / $cellSize); $cellY++) {
                    for ($cellX = 0; $cellX < ($this->tileSize / $cellSize); $cellX++) {
                        // 计算在原始地图中的坐标
                        $mapX = $tileX * ($this->tileSize / $cellSize) + $cellX;
                        $mapY = $tileY * ($this->tileSize / $cellSize) + $cellY;
                        // 检查是否超出地图边界
                        if ($mapX < $this->width && $mapY < $this->height) {
                            // 获取当前字符
                            $char = $this->map[$mapY][$mapX];
                        } else {
                            $char = $this->defaultChar;
                        }
                        $color = $this->colors[$char] ?? $this->transColor($this->defaultCharColor);
                        $fontSize  = $this->getFontSizeForChar();
                        if ($fontSize) {
                            $this->fillChar($image, $char, $cellX, $cellY, $color, $fontSize);
                        } else {
                            $this->fillRect($image, $cellX, $cellY, $color);
                        }

                    }
                }

                // 保存Tile图像，包含缩放级别
                $tileFileName = __DIR__ . "/../tiles/{$zoomLevel}/{$tileX}_{$tileY}.png";
                imagepng($image, $tileFileName);

                // 释放内存
                imagedestroy($image);
            }
        }
    }

    public function fillChar($image, $char, $cellX, $cellY, $color, $font_size = 12)
    {
        // 计算格子中心位置
        $cellCenterX = $cellX * $this->cellSize + $this->cellSize / 2;
        $cellCenterY = $cellY * $this->cellSize + $this->cellSize / 2;
        $fontPath = __DIR__ . '/NotoMono-Regular.ttf';
        if (!file_exists($fontPath)) {
            throw new Exception("Font file not found: $fontPath");
        }
        imagettftext($image, $font_size, 0, $cellCenterX - 4, $cellCenterY + 4, $color, $fontPath, $char);
    }

    public function fillRect($image, $cellX, $cellY, $color)
    {
        // 计算格子左上角位置
        $cellTopLeftX = $cellX * $this->cellSize;
        $cellTopLeftY = $cellY * $this->cellSize;
        imagefilledrectangle($image, $cellTopLeftX, $cellTopLeftY, $cellTopLeftX + $this->cellSize - 1, $cellTopLeftY + $this->cellSize - 1, $color);
    }

    private function getFontSizeForChar()
    {
        if ($this->cellSize < $this->minFontSize) {
            return 0;
        }
        if ($this->cellSize == 8 || $this->cellSize == 16) {
            return $this->cellSize;
        }
        return $this->cellSize;
    }

    private function transColor($color)
    {
        // 将默认颜色从 #RRGGBB 格式转换为整数格式
        $charColor = sscanf($color, '#%02x%02x%02x');
        return imagecolorallocate(imagecreatetruecolor(1, 1), $charColor[0], $charColor[1], $charColor[2]);
    }
}

try {
    // 获取命令行参数
    $options = getopt("m:z:c:");

    // 检查是否提供了所有必需的参数
    if (empty($options)) {
        throw new Exception("Usage: php tile.php -m <mapFilePath> (-z <zoomLevel>) (-c <cellSize>)\n");
    }

    // 获取参数值
    $mapFilePath = $options['m'];
    // 检查文件是否存在
    if (!file_exists($mapFilePath)) {
        throw new Exception("Map file not found: $mapFilePath");
    }


    $zoomLevel = (int)($options['z'] ?? 0);
    $cellSize = (int)($options['c']  ?? 1);

    // 创建生成器实例
    $generator = new TileGenerator($mapFilePath);
    $generator->generateTiles($zoomLevel, $cellSize);
    echo "Tile images generated successfully.\n";
} catch (Exception $e) {
    echo $e->getMessage(),"\n";
}
