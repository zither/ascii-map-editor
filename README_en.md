# ASCII Map Editor

![Ascii Map Editor](./assets/screenshot.png)

A simple tool for creating and editing ASCII maps.

## Usage

- After opening the page, click "Load Map" to preview and edit the preset map for easy testing.
- Select the map text file and the map character settings data, then click the "Load Map" button to load the map.
- Click "Export Map" to save the modified map as a text file.

## Editing Operations

- Before editing the map, click the buttons in the character button group to select the character you want to edit.
- Single character modification: Left-click on the map area to modify the corresponding character.
- Automatic modification: Hold down the Ctrl key and move the mouse over the map area to automatically modify characters.
- Batch modification: Hold down the Shift key, left-click on the map area and drag to select an area, then replace the characters within the selected area in bulk.

## Moving the Map

- The arrow keys on the keyboard can move the map in 10-grid increments.
- The mouse wheel can scroll the map up and down.
- The directional movement buttons on the sidebar can move the map in 1-grid increments.
- Hold down the Alt key, left-click on the map area and drag to pan the map.

## Demo

Editor Demo: [https://zither.github.io/ascii-map-editor/](https://zither.github.io/ascii-map-editor/)

Map Viewer Demo: [https://zither.github.io/ascii-map-editor/leaflet.html](https://zither.github.io/ascii-map-editor/leaflet.html)

## Dynamic Map Preview

```
$ cd scripts
$ php -S localhost:8888 tile_generator.php
```

Then open `http://localhost:8888/leaflet_demo.html` in your browser.

## Generate Tile Images

```
$ cd scripts
$ php tile_generator.php  //View usage
$ php tile_generator.php -m ../examples/map.txt -c ../examples/chars.json -z 0 -s 1
```