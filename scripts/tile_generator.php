<?php

class TileGenerator 
{
    private $tileSize = 256;
    private $defaultChar = '~';
    private $defaultCharColor = '#0000AA';
    private $tileDir = __DIR__ . '/tiles';
    private $fontPath = __DIR__ . '/NotoMono-Regular.ttf';
    private $width;
    private $height;
    private $map = [];
    private $chars = [];
    private $colors = [];
    private $minFontSize = 8;
    private $cellSize = 16;

    public function __construct(string $mapFilePath, string $charFilePath)
    {
        if (!file_exists($mapFilePath)) {
            throw new Exception('Map file not found');
        }
        $asciiMap = file_get_contents($mapFilePath);
        if ($asciiMap === false) {
            throw new Exception("Failed to read map file.");
        }

        if (!file_exists($charFilePath)) {
            throw new Exception('Char file not found');
        }
        $charsJson = file_get_contents($charFilePath);
        if ($charsJson === false) {
            throw new Exception("Failed to read char file.");
        }
        $this->chars = json_decode($charsJson, true);

        $this->map = explode("\n", $asciiMap);
        $this->width = strlen($this->map[0]);
        $this->height = count($this->map);
        foreach ($this->chars as $charDef) {
            $this->colors[$charDef['char']] = $this->transColor($charDef['color']);
        }
    }

    public function setTileDir(string $dir)
    {
        $this->tileDir = $dir;
    }

    public function setFontPath(string $fontPath)
    {
        $this->fontPath = $fontPath;
    }

    public function generateTiles(int $zoomLevel, $cellSize = 16)
    {
        if (!file_exists($this->tileDir . "/{$zoomLevel}")) {
            mkdir($this->tileDir . "/{$zoomLevel}", 0777, true);
        }
        $numTilesX = ceil($this->width / ($this->tileSize / $cellSize));
        $numTilesY = ceil($this->height / ($this->tileSize / $cellSize));
        $this->cellSize = $cellSize;
        for ($tileY = 0; $tileY < $numTilesY; $tileY++) {
            for ($tileX = 0; $tileX < $numTilesX; $tileX++) {
                $tileFileName = $this->tileDir . "/{$zoomLevel}/{$tileX}_{$tileY}.png";
                $this->generateTile($tileX, $tileY, $zoomLevel, $cellSize, $tileFileName);
            }
        }
    }

    public function generateTile(int $tileX, int $tileY, int $zoomLevel, int $cellSize = null, string $savePath = null)
    {
        if (!is_null($cellSize)) {
            $this->cellSize = $cellSize;
        } else {
            $this->cellSize = $cellSize = pow(2, $zoomLevel);
        }

        $image = imagecreatetruecolor($this->tileSize, $this->tileSize);
        for ($cellY = 0; $cellY < ($this->tileSize / $cellSize); $cellY++) {
            for ($cellX = 0; $cellX < ($this->tileSize / $cellSize); $cellX++) {
                $mapX = $tileX * ($this->tileSize / $cellSize) + $cellX;
                $mapY = $tileY * ($this->tileSize / $cellSize) + $cellY;
                if ($mapX < $this->width && $mapY < $this->height) {
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
        if ($savePath) {
            imagepng($image, $savePath);
            imagedestroy($image);
        } else {
            ob_start();
            imagepng($image);
            $content = ob_get_contents();
            ob_end_clean();
            imagedestroy($image);
            return $content;
        }
    }


    public function fillChar($image, $char, $cellX, $cellY, $color, $font_size = 12)
    {
        $cellCenterX = $cellX * $this->cellSize + $this->cellSize / 2;
        $cellCenterY = $cellY * $this->cellSize + $this->cellSize / 2;
        if (!file_exists($this->fontPath)) {
            throw new Exception("Font file not found: $this->fontPath");
        }
        imagettftext($image, $font_size, 0, $cellCenterX - 4, $cellCenterY + 4, $color, $this->fontPath, $char);
    }

    public function fillRect($image, $cellX, $cellY, $color)
    {
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
        $charColor = sscanf($color, '#%02x%02x%02x');
        return imagecolorallocate(imagecreatetruecolor(1, 1), $charColor[0], $charColor[1], $charColor[2]);
    }
}

if (php_sapi_name() === 'cli') {
    try {
        $options = getopt("m:c:z:s:");
        if (empty($options)) {
            throw new Exception("Usage: php tile.php -m <mapFilePath> -c <charFilePath> (-z <zoomLevel>) (-s <cellSize>)\n");
        }
        $mapFilePath = $options['m'];
        $charFilePath = $options['c'];
        $zoomLevel = (int)($options['z'] ?? 0);
        $cellSize = isset($options['s']) ? (int)$options['s'] : pow(2, $zoomLevel);
        $generator = new TileGenerator($mapFilePath, $charFilePath);
        $generator->generateTiles($zoomLevel, $cellSize);
        echo "Tile images generated successfully.\n";
    } catch (Exception $e) {
        echo $e->getMessage(), "\n";
    }
}

if (php_sapi_name() === 'cli-server') {
    $requestUri =$_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('/\.(?:html|js|css)$/', $requestUri)) {
        return false; 
    }

    if (empty($requestUri) || !preg_match('/\/(\d+)\/(\d+)_(\d+)\.png/', $requestUri, $matches)) {
        printf('Expected URI: http://%s:%s/z/x_y.png', $_SERVER['SERVER_NAME'], $_SERVER['SERVER_PORT']);
        exit;
    }
    $z = (int)$matches[1];
    $x = (int)$matches[2];
    $y = (int)$matches[3];

    $mapFile = __DIR__ . '/../examples/map.txt';
    $charFile = __DIR__ . '/../examples/chars.json';
    $generator = new TileGenerator($mapFile, $charFile);
    echo $generator->generateTile($x, $y, $z);
}
