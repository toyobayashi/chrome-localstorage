/// <reference types="node" />

import {
  LevelDown,
  LevelDownOpenOptions,
  Bytes,
  LevelDownGetOptions,
  LevelDownPutOptions,
  LevelDownDelOptions,
  LevelDownBatchOptions,
  LevelDownClearOptions,
  LevelDownIterator,
  LevelDownIteratorOptions
} from 'leveldown'

import {
  AbstractBatch,
  AbstractChainedBatch
} from 'abstract-leveldown'

export declare interface LevelDownIteratorResult {
  key: string | Buffer
  value: string | Buffer
}

export declare interface LevelDownAsyncIterator extends LevelDownIterator, AsyncIterableIterator<LevelDownIteratorResult> {
}

export declare interface LevelDownPromisify extends LevelDown {
  open (options?: LevelDownOpenOptions): Promise<void>

  get (key: Bytes, options?: LevelDownGetOptions): Promise<void>

  put(key: Bytes, value: Bytes, options?: LevelDownPutOptions): Promise<void>

  del(key: Bytes, options?: LevelDownDelOptions): Promise<void>

  batch(array: AbstractBatch[], options?: LevelDownBatchOptions): Promise<AbstractChainedBatch<Bytes, Bytes>>

  clear(options?: LevelDownClearOptions): Promise<void>

  approximateSize(start: Bytes, end: Bytes): Promise<number>
  compactRange(start: Bytes, end: Bytes): Promise<void>

  iterator(options?: LevelDownIteratorOptions): LevelDownAsyncIterator
}

declare function level (location: string): LevelDownPromisify

export default level
