import { scaleQuantize } from 'd3-scale';
import { schemeYlOrRd } from 'd3-scale-chromatic';

export default function colorScale(domain) {
  return scaleQuantize().domain(domain).range(schemeYlOrRd[7]);
}
