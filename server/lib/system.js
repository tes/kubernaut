import systemic from 'systemic';
import path from 'path';

const components = path.join(__dirname, 'components');

export default () => systemic({ name: 'kubernaut' })
    .bootstrap(components);

