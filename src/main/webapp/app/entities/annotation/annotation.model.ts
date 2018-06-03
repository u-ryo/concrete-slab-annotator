import { BaseEntity } from './../../shared';

export const enum DefectName {
    'CRACK',
    'EFFLORESCENCE',
    'DONT_CARE',
    'SPALLING',
    'POPOUT',
    'SCALING',
    'CHALK',
    'WETTING',
    'RUST_FLUID',
    'REINFORCEMENT_EXPOSURE',
    'HONEY_COMB',
    'AIR_VOID',
    'STAIN_DISCOLORATION'
}

export class Annotation implements BaseEntity {
    constructor(
        public id?: number,
        public squareSize?: number,
        public defect?: DefectName,
        public rectangles?: BaseEntity[],
        public image?: BaseEntity,
    ) {
    }
}
