import { scaleQuantize } from 'd3-scale';

const greyBlue7 = [
  '#f2f2f2',
  '#e0e0e0',
  '#c6d4e6',
  '#9ebede',
  '#6d9fd0',
  '#397cb6',
  '#08306b',
];

export default function createColorScale(domain) {
  return scaleQuantize(domain, greyBlue7);
}
