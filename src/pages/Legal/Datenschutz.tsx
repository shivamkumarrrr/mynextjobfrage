import { LegalPage } from './LegalPage';
import { datenschutzBlocks } from './datenschutzContent';

export function Datenschutz() {
  return <LegalPage blocks={datenschutzBlocks} />;
}
