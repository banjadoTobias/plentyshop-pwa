import { describe, expect, it } from 'vitest';
import { planMotivUpload } from '../runtime/utils/order-property-plan';

describe('Sichtbarkeit der Wunschmotiv-Eigenschaften', () => {
  it('should render the upload and take over both preview fields when 189 is linked', () => {
    expect(planMotivUpload([189, 153, 154, 12])).toEqual({
      rendersMotivUpload: true,
      hiddenPropertyIds: [153, 154],
    });
  });

  it('should leave the preview fields standing while 189 is not linked to the variations', () => {
    expect(planMotivUpload([153, 154])).toEqual({
      rendersMotivUpload: false,
      hiddenPropertyIds: [],
    });
  });

  it('should leave a lone preview field visible, because the panel needs both', () => {
    expect(planMotivUpload([189, 153])).toEqual({
      rendersMotivUpload: true,
      hiddenPropertyIds: [],
    });
    expect(planMotivUpload([189, 154])).toEqual({
      rendersMotivUpload: true,
      hiddenPropertyIds: [],
    });
  });

  it('should render the upload alone while only 189 is linked', () => {
    expect(planMotivUpload([189])).toEqual({
      rendersMotivUpload: true,
      hiddenPropertyIds: [],
    });
  });

  it('should stay quiet for a product without any of the three properties', () => {
    expect(planMotivUpload([])).toEqual({
      rendersMotivUpload: false,
      hiddenPropertyIds: [],
    });
  });
});
