import { useEffect, useState } from 'react';

const player = 2;
const alive = 1;
const dead = 0;
export type PlayerCell = { state: typeof player };
export type AliveCell = { state: typeof alive; ticksAlive: number };
export type DeadCell = { state: typeof dead };
export type Cell = AliveCell | DeadCell | PlayerCell;
export type Population = Cell[][];

export function GameOfLife() {
  const [population, setPopulation] = useState((): Population => {
    const height = 64;
    const width = 64;
    const initialPopulation = Array.from({ length: height }, () =>
      Array.from(
        { length: width },
        (): Cell => (Math.random() < 0.2 ? newbornCell() : deadCell())
      )
    );
    initialPopulation[0][0] = playerCell();
    return initialPopulation;
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setPopulation(tick);
    }, 300);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      'keydown',
      (evt) => {
        const direction = mapKey(evt);
        setPopulation((pop) => movePlayer(pop, direction));
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

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

export function playerCell(): PlayerCell {
  return { state: player };
}

export function olderCell(cell: AliveCell): AliveCell {
  return { state: alive, ticksAlive: cell.ticksAlive + 1 };
}

function wrap(index: number, size: number) {
  const wrapped = index % size;
  return wrapped < 0 ? wrapped + size : wrapped;
}

function nextState(lastState: Cell, aliveNeighbors: number): Cell {
  if (lastState.state === player) {
    return lastState;
  } else if (aliveNeighbors > 3) {
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

const directions = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  none: 'none',
} as const;

type Direction = (typeof directions)[keyof typeof directions];

function mapKey(evt: KeyboardEvent): Direction {
  if (evt.code === 'ArrowUp') {
    return directions.up;
  }
  if (evt.code === 'ArrowDown') {
    return directions.down;
  }
  if (evt.code === 'ArrowLeft') {
    return directions.left;
  }
  if (evt.code === 'ArrowRight') {
    return directions.right;
  }
  return directions.none;
}

function movePlayer(
  lastPopulation: Population,
  direction: Direction
): Population {
  const height = lastPopulation.length;
  const width = lastPopulation[0].length;
  const nextPopulation: Population = Array.from(
    { length: height },
    (_, rowIndex) =>
      Array.from(
        { length: width },
        (_, colIndex) => lastPopulation[rowIndex][colIndex]
      )
  );

  const lastPosition = findPlayer(lastPopulation);
  if (lastPosition) {
    nextPopulation[lastPosition.row][lastPosition.col] = newbornCell();
    const nextPosition = calcPlayerPosition(
      lastPosition,
      { width, height },
      direction
    );
    nextPopulation[nextPosition.row][nextPosition.col] = playerCell();
  }

  return nextPopulation;
}

function findPlayer(population: Population): Position | undefined {
  const height = population.length;
  const width = population[0].length;

  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    for (let colIndex = 0; colIndex < width; colIndex++) {
      if (population[rowIndex][colIndex].state === player) {
        return { row: rowIndex, col: colIndex };
      }
    }
  }

  return undefined;
}

type Position = { row: number; col: number };
type Size = { width: number; height: number };

function calcPlayerPosition(
  lastPosition: Position,
  worldSize: Size,
  direction: Direction
): Position {
  const { row, col } = lastPosition;
  const { height, width } = worldSize;

  if (direction === directions.up) {
    return { row: wrap(row - 1, height), col };
  }
  if (direction === directions.down) {
    return { row: wrap(row + 1, height), col };
  }
  if (direction === directions.left) {
    return { row, col: wrap(col - 1, width) };
  }
  if (direction === directions.right) {
    return { row, col: wrap(col + 1, width) };
  }
  return lastPosition;
}

function chooseColor(cell: Cell) {
  if (cell.state === dead) {
    return 'bg-slate-950';
  }
  if (cell.state === player) {
    return 'bg-lime-500';
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
