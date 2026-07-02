import type { DataSource } from './DataSource'
import { MockDataSource } from './mock/MockDataSource'

/**
 * Единственная точка, знающая, откуда берутся данные — «точка подмены».
 * Чтобы подключить реальный бэкенд, достаточно заменить реализацию на
 * `new RealDataSource()`; слайсы, селекторы и UI при этом не меняются.
 */
export const dataSource: DataSource = new MockDataSource()
