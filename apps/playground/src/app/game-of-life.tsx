import { useEffect, useState } from 'react';

const alive = 1;
const dead = 0;
export type AliveCell = { state: typeof alive; ticksAlive: number };
export type DeadCell = { state: typeof dead };
export type Cell = AliveCell | DeadCell;
export type Population = Cell[][];

export function GameOfLife() {
  const [population, setPopulation] = useState((): Population => {
    const height = 64;
    const width = 64;
    return Array.from({ length: height }, () =>
      Array.from(
        { length: width },
        (): Cell => (Math.random() < 0.2 ? newbornCell() : deadCell())
      )
    );
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setPopulation(tick);
    }, 300);

    return () => {
      window.clearInterval(id);
    };
  });

  return (
    <div className="flex flex-col gap-px">
      {population.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-px">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`flex-auto aspect-square rounded border border-slate-300  transition-colors duration-200 ${chooseColor(
                cell
              )}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function deadCell(): DeadCell {
  return { state: dead };
}

export function newbornCell(): AliveCell {
  return { state: alive, ticksAlive: 1 };
}

export function olderCell(cell: AliveCell): AliveCell {
  return { state: alive, ticksAlive: cell.ticksAlive + 1 };
}

function wrap(index: number, size: number) {
  const wrapped = index % size;
  return wrapped < 0 ? wrapped + size : wrapped;
}

function nextState(lastState: Cell, aliveNeighbors: number): Cell {
  if (aliveNeighbors > 3) {
    return deadCell();
  } else if (aliveNeighbors < 2) {
    return deadCell();
  } else if (lastState.state === alive) {
    return olderCell(lastState);
  } else if (aliveNeighbors === 3) {
    return newbornCell();
  } else {
    return lastState;
  }
}

function tick(lastPopulation: Population) {
  const height = lastPopulation.length;
  const width = lastPopulation[0].length;
  const nextPopulation: Population = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => deadCell())
  );

  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const above = wrap(rowIndex - 1, height);
    const below = wrap(rowIndex + 1, height);
    for (let colIndex = 0; colIndex < width; colIndex++) {
      const left = wrap(colIndex - 1, width);
      const right = wrap(colIndex + 1, width);
      const neighbors = [
        lastPopulation[above][left],
        lastPopulation[above][colIndex],
        lastPopulation[above][right],
        lastPopulation[rowIndex][left],
        lastPopulation[rowIndex][right],
        lastPopulation[below][left],
        lastPopulation[below][colIndex],
        lastPopulation[below][right],
      ];
      const aliveNeighbors = neighbors.reduce(
        (sum: number, x) => sum + x.state,
        0
      );
      nextPopulation[rowIndex][colIndex] = nextState(
        lastPopulation[rowIndex][colIndex],
        aliveNeighbors
      );
    }
  }

  return nextPopulation;
}

function chooseColor(cell: Cell) {
  if (cell.state === dead) {
    return 'bg-slate-950';
  }
  if (cell.ticksAlive === 1) {
    return 'bg-red-600';
  }
  if (cell.ticksAlive < 3) {
    return 'bg-orange-600';
  }
  if (cell.ticksAlive < 5) {
    return 'bg-yellow-400';
  }
  if (cell.ticksAlive < 10) {
    return 'bg-yellow-100';
  }
  return 'bg-slate-50';
}
