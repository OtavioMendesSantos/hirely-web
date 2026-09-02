import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.checkbox = ({ checked }) => {
    return `<input type="checkbox" ${checked ? 'checked' : ''}>`;
  };

  return {
    renderer: renderer,
    gfm: true,
  };
}
