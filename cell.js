class Cell {
    constructor(val, row, col) {
        this.collapsed = false;
        this.options = val;

        this.row = row;
        this.col = col;


        let up = row > 0;
        let right = col < DIM - 1; 
        let down = row < DIM - 1;
        let left = col > 0;
        
        this.openNeighbors = [up, right, down, left]; 
        this.neighbors = [up, right, down, left]; 

        this.locations = [
            this.col + (this.row - 1) * DIM, //up
            this.col + 1 + this.row * DIM, //right
            this.col + (this.row + 1) * DIM, //down
            this.col - 1 + this.row * DIM //left
        ]
    }

    hasNeighbors() {
        return this.openNeighbors.some(x => x);
    }

    getValidNeighbors() {
        let validNeighbors = []; // indexes of valid neighbors

        for (let i = 0; i < this.locations.length; i++){
            if (this.openNeighbors[i]){
                validNeighbors.push(this.locations[i]);
            }
        }
        return validNeighbors;
    }

    getAllNeighbors() {
        let neighbors = []; // indexes of all neighbors

        for (let i = 0; i < this.locations.length; i++){
            if (this.neighbors[i]){
                neighbors.push(this.locations[i]);
            } else {
                neighbors.push(-1);
            }
        }
        return neighbors;
    }


}