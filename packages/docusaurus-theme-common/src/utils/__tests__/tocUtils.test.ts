/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {TOCItem} from '@docusaurus/types';
import {renderHook} from '@testing-library/react-hooks';
import {useFilteredAndTreeifiedTOC} from '../tocUtils';

describe('useFilteredAndTreeifiedTOC', () => {
  test('filter a toc with all heading levels', () => {
    const toc: TOCItem[] = [
      {
        id: 'alpha',
        level: 1,
        value: 'alpha',
      },
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
      },
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
      },
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
      },
      {
        id: 'echo',
        level: 5,
        value: 'Echo',
      },
      {
        id: 'foxtrot',
        level: 6,
        value: 'Foxtrot',
      },
    ];

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 2,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 3,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [
          {
            id: 'charlie',
            level: 3,
            value: 'Charlie',
            children: [],
          },
        ],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [
          {
            id: 'charlie',
            level: 3,
            value: 'Charlie',
            children: [
              {
                id: 'delta',
                level: 4,
                value: 'Delta',
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  // It's not 100% clear exactly how the TOC should behave under weird heading
  // levels provided by the user. Adding a test so that behavior stays the same
  // over time
  test('filter invalid heading levels (but possible) TOC', () => {
    const toc: TOCItem[] = [
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
      },
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
      },
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
      },
    ];

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 2,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 3,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 4,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 2,
          maxHeadingLevel: 3,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
      {
        id: 'bravo',
        level: 2,
        value: 'Bravo',
        children: [],
      },
    ]);

    expect(
      renderHook(() =>
        useFilteredAndTreeifiedTOC({
          toc,
          minHeadingLevel: 3,
          maxHeadingLevel: 4,
        }),
      ).result.current,
    ).toEqual([
      {
        id: 'charlie',
        level: 3,
        value: 'Charlie',
        children: [],
      },
      {
        id: 'delta',
        level: 4,
        value: 'Delta',
        children: [],
      },
    ]);
  });
});
