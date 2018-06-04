import { BaseEntity } from './../../shared';

export enum DefectName {
    CRACK = 'CRACK',
    EFFLORESCENCE = 'EFFLORESCENCE',
    DONT_CARE = 'DONT_CARE',
    SPALLING = 'SPALLING',
    POPOUT = 'POPOUT',
    SCALING = 'SCALING',
    CHALK = 'CHALK',
    WETTING = 'WETTING',
    RUST_FLUID = 'RUST_FLUID',
    REINFORCEMENT_EXPOSURE = 'REINFORCEMENT_EXPOSURE',
    HONEY_COMB = 'HONEY_COMB',
    AIR_VOID = 'AIR_VOID',
    STAIN_DISCOLORATION = 'STAIN_DISCOLORATION'
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
