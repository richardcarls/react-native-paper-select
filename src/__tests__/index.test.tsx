import defaultExport from '../PaperSelect';
import { PaperSelect } from '../PaperSelect';

describe('package', () => {
  it('should export PaperSelect', () => {
    expect(defaultExport).toBeDefined();
    expect(PaperSelect).toBeDefined();
  });
});
