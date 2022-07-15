function invertedMatch(a, b) {
    let left = 0;
    let right = b.length - 1;
    while (left < b.length && right > -1) {
        if (a.charAt(left) !== b.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

function removeDupeTiles(tiles) {
    const uniqueEdges = [];

    return tiles.filter(tile => {
        const edges = tile.edges.join(''); //Combined String of Edges
        const isDupe = uniqueEdges.includes(edges);

        if (!isDupe) {
            uniqueEdges.push(edges);
            return true;
        }
        return false;
    });

}

class Tile {
    constructor(image, edges, index) {
        this.image = image;
        this.edges = edges; // up right down left
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
        this.index = index;
    }

    adjacencyMatches(tiles) {
        let edgeToLoc = {
            0: this.up,
            1: this.right,
            2: this.down,
            3: this.left
        };

        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            if (tile.index == 5 && this.index == 5) continue;

            for (let edge in edgeToLoc) {
                let loc = edgeToLoc[edge];
                const thisEdge = parseInt(edge);
                const tileEdge = (thisEdge + 2) % 4;
                if (invertedMatch(this.edges[thisEdge], tile.edges[tileEdge])) {
                    loc.push(i);
                }
            }
        }
    }

    rotate(n) {
        const w = this.image.width;
        const h = this.image.height;
        const image = createGraphics(w, h);

        image.imageMode(CENTER);
        image.translate(w / 2, h / 2);
        image.rotate(HALF_PI * n);
        image.image(this.image, 0, 0);

        const edgesTwo = this.edges.slice();

        for (let i = 0; i < n; i++) {
            edgesTwo.unshift(edgesTwo.pop());
        }
        return new Tile(image, edgesTwo, this.index);
    }
}