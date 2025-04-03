import { render } from '@testing-library/react';

import { GameOfLife } from './game-of-life';

describe('GameOfLife', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GameOfLife />);
    expect(baseElement).toBeTruthy();
  });
});
