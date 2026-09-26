import { act, renderHook } from '@testing-library/react';
import { useDocumentDirection } from './useDocumentDirection';

describe('useDocumentDirection', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('defaults to ltr when <html> has no dir', () => {
    const { result } = renderHook(() => useDocumentDirection());
    expect(result.current).toBe('ltr');
  });

  it('reads <html dir> and follows later changes', async () => {
    document.documentElement.dir = 'rtl';
    const { result } = renderHook(() => useDocumentDirection());
    expect(result.current).toBe('rtl');

    // MutationObserver callbacks run as a microtask.
    await act(async () => {
      document.documentElement.dir = 'ltr';
    });
    expect(result.current).toBe('ltr');
  });
});
