import { BaseEntity } from './../../shared';

export enum Camera {
    'IXU1000'
}

export class Image implements BaseEntity {
    constructor(
        public id?: number,
        public filename?: string,
        public width?: number,
        public height?: number,
        public focalLength?: number,
        public distance?: number,
        public camera?: Camera,
        public annotations?: BaseEntity[],
    ) {
    }
}
