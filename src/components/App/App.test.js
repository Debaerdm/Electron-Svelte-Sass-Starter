import App from './App.svelte';
import { render } from '@testing-library/svelte';

describe('App Component', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should render', () => {
    const { container } = render(App);

    const title = container.getElementsByTagName('h1')[0];

    expect('Welcom to you\'r univers!').toBe(title.innerHTML);
  });
});
