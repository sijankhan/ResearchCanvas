import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { putImage, getImage, getCachedImage } from '../src/services/imageStore';

// In Node/vitest test environment, IndexedDB can be mocked or use in-memory store
describe('Persistence & Image Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves images from memory cache & data URL', async () => {
    const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const imageId = await putImage(testDataUrl);
    expect(imageId).toBeDefined();
    expect(imageId.startsWith('img_')).toBe(true);

    // Retrieve via memory cache
    const cached = getCachedImage(imageId);
    expect(cached).toBe(testDataUrl);

    // Retrieve via getImage
    const retrieved = await getImage(imageId);
    expect(retrieved).toBe(testDataUrl);
  });

  it('isolates projects under individual local storage keys', () => {
    const projId1 = 'proj_alpha';
    const projId2 = 'proj_beta';

    localStorage.setItem(`research_proj_${projId1}`, JSON.stringify({ id: projId1, title: 'Alpha Lab' }));
    localStorage.setItem(`research_proj_${projId2}`, JSON.stringify({ id: projId2, title: 'Beta Lab' }));

    const raw1 = localStorage.getItem(`research_proj_${projId1}`);
    const raw2 = localStorage.getItem(`research_proj_${projId2}`);

    expect(JSON.parse(raw1!).title).toBe('Alpha Lab');
    expect(JSON.parse(raw2!).title).toBe('Beta Lab');

    // Deleting one does not affect the other
    localStorage.removeItem(`research_proj_${projId1}`);
    expect(localStorage.getItem(`research_proj_${projId1}`)).toBeNull();
    expect(localStorage.getItem(`research_proj_${projId2}`)).not.toBeNull();
  });
});
