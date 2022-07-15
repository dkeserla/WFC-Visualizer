

let tiles = [];
const tileImages = [];

let grid = [];
let borderCells = [];

var DIM = 25;
let failure = null;
let extraWidth = 0;
let extraHeight = 50;

let restartButton;

function preload() {
    const path = './circuit';
    for (let i = 0; i < 13; i++) {
        tileImages[i] = loadImage(`${path}/${i}.png`);
    }
}

function setup() {
    createCanvas(600, 600);

    restartButton = createButton('Restart');
    restartButton.position(150, height - 25);
    restartButton.mousePressed(reactivate);

    // jsonify
    tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA'], 0);
    tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB'], 1);
    tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB'], 2);
    tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB'], 3);
    tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA'], 4);
    tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA'], 5);
    tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB'], 6);
    tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB'], 7);
    tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB'], 8);
    tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB'], 9);
    tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB'], 10);
    tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB'], 11);
    tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB'], 12);

    const intialTiles = tiles.length;
    for (let i = 0; i < intialTiles; i++) {
        let temp = [];
        for (let j = 0; j < 4; j++) {
            temp.push(tiles[i].rotate(j));
        }
        temp = removeDupeTiles(temp);
        tiles = tiles.concat(temp);
    }

    for (let i = 0; i < tiles.length; i++) {
        tiles[i].adjacencyMatches(tiles);
    }

    reactivate();
}

function draw() {
    const w = (width - extraWidth) / DIM;
    const h = (height - extraHeight) / DIM;

    if (failure){
        drawCells();
        fill('red');
        rect(failure.col * w, failure.row * h, w, h);
        textSize(30);
        fill('red');
        textFont('Georgia');
        text('Failure | row: ' + failure.row + ', col: ' + failure.col, 225, height - 15);
        return;
    }

    drawCells();
    fill('yellow');
    textSize(30);
    textFont('Georgia');
    text('In Progress', 225, height - 15);

    // // Pick cell with least entropy
    let gridCopy = getNeighbors();
    if (gridCopy.length == 0) {
        drawCells();
        fill('green');
        textSize(30);
        textFont('Georgia');
        text('Complete', 225, height - 15);
        return;
    }
    gridCopy.sort((a, b) => a.options.length - b.options.length);
    gridCopy = removeLargeEntropy(gridCopy);

    const cell = random(gridCopy);

    updateNeighbors(cell);

    // only keep the ones that have neighbors
    if (cell.hasNeighbors()){
        borderCells.push(cell);
    }

    collapseAndPropagateInfo(cell);
}

function drawCells(){
    const w = (width - extraWidth) / DIM;
    const h = (height - extraHeight) / DIM;
    background(0);
    for (let row = 0; row < DIM; row++) {
        for (let col = 0; col < DIM; col++) {
            let cell = grid[col + row * DIM];
            if (cell.collapsed) {
                let index = cell.options[0];
                if (tiles[index] !== undefined){
                    image(tiles[index].image, col * w, row * h, w, h);
                }
            } else {
                noFill();
                stroke(75);
                rect(col * w, row * h, w, h);
            }
        }
    }
}

// update neighbors of the selected cell to know that this cell is
// no longer a valid cell (it is collapsed)
function updateNeighbors(cell){
    let neighbors = cell.getAllNeighbors();
    for (let cellPos = 0; cellPos < neighbors.length; cellPos++){
        let neighborIndex = neighbors[cellPos];
        if (neighborIndex != -1){
            let neighbor = grid[neighborIndex];
            let neighborPos = (cellPos + 2) % 4;
            neighbor.openNeighbors[neighborPos] = false;
        }
    }
}

// fix for redoing when failing
function reactivate() {
    const tilesOptions = Array.from(Array(tiles.length).keys()); 
    for (let r = 0; r < DIM; r++){
        for (let c = 0; c < DIM; c++){
            let index = c + r * DIM;
            grid[index] = new Cell(tilesOptions, r, c);
        }
    }

    failure = null;
    const cell = random(grid);
    updateNeighbors(cell);
    borderCells = [cell];
    collapseAndPropagateInfo(cell);
}

function getNeighbors(){
    // we have a maintained list of border cells called borderCells
    let neighborIndexes = [];

    for (let borderCell of borderCells) {
        let validNeighbors = borderCell.getValidNeighbors();
        neighborIndexes = neighborIndexes.concat(validNeighbors);
    }

    //removes duplicates in the uncollapsed neighbors list
    neighborIndexes = [...new Set(neighborIndexes)];
    return convertNeighbors(neighborIndexes); 
}

function convertNeighbors(neighborIndexes){
    let neighbors = [];
    for (let index of neighborIndexes){
        neighbors.push (grid[index]);
    }
    return neighbors;
}


function removeLargeEntropy(gridCopy){
    let newGridCopy = [];
    let min = gridCopy[0].options.length;
    for (let cell of gridCopy){
        if (cell.options.length == min){
            newGridCopy.push(cell);
        } else {
            break;
        }
    }
    return newGridCopy;
}


// updates all cells based on info from the currently collapsed cell
function collapseAndPropagateInfo(cell){
    cell.collapsed = true;
    const pick = random(cell.options);
    if (pick === undefined) {
        failure = cell;
        return;
    }
    cell.options = [pick];

    const tilesOptions = Array.from(Array(tiles.length).keys());
    for (let row = 0; row < DIM; row++) {
        for (let col = 0; col < DIM; col++) {
            let index = col + row * DIM;
            if (!grid[index].collapsed) {
                let options = tilesOptions.map((c) => c);
                // up
                if (row > 0) {
                    let up = grid[col + (row - 1) * DIM];
                    createValidOptions(up, "down", options);
                }
                // right
                if (col < DIM - 1) {
                    let right = grid[col + 1 + row * DIM];
                    createValidOptions(right, "left", options);
                }
                // down
                if (row < DIM - 1) {
                    let down = grid[col + (row + 1) * DIM];
                    createValidOptions(down, "up", options);
                }
                // left
                if (col > 0) {
                    let left = grid[col - 1 + row * DIM];
                    createValidOptions(left, "right", options);
                }

                grid[index].options = options;
            }
        }
    }
}

// updates the valid options for cells after information is propagated
function createValidOptions(pos, loc, options) {
    let validOptions = [];
    for (let option of pos.options) {
        let locToOptions = {
            up: tiles[option].up,
            right: tiles[option].right,
            down: tiles[option].down,
            left: tiles[option].left
        }

        validOptions = validOptions.concat(locToOptions[loc]);
    }

    for (let i = options.length - 1; i >= 0; i--) {
        let element = options[i];
        if (!validOptions.includes(element)) {
            options.splice(i, 1);
        }
    }
}