import { LegalPage } from './LegalPage';
import { impressumBlocks } from './impressumContent';

export function Impressum() {
  return <LegalPage blocks={impressumBlocks} />;
}
