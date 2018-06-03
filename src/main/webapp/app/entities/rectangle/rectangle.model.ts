import { BaseEntity } from './../../shared';

export class Rectangle implements BaseEntity {
    constructor(
        public id?: number,
        public x?: number,
        public y?: number,
        public width?: number,
        public height?: number,
        public coordinateX?: number,
        public coordinateY?: number,
        public pending?: boolean,
        public comment?: string,
        public annotation?: BaseEntity,
    ) {
        this.pending = false;
    }
}
