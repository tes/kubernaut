import System from 'systemic';
import path from 'path';

export default function() {
  return new System({ name: 'kubernaut', })
    .bootstrap(path.join(__dirname, 'components'));
}
