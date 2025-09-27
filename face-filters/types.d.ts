/**
 * Face Filters Types (IDE assistance for JS project)
 */

export interface Vector3 { x:number; y:number; z:number }
export interface Quaternion { x:number; y:number; z:number; w:number }

export interface HeadPose {
  position: Vector3; // in camera space units (meters)
  rotation: Quaternion; // quaternion
}

export interface Landmark { x:number; y:number; z?:number; visibility?:number }

export interface PoseData {
  head: HeadPose;
  landmarks: Landmark[]; // 2D/3D facial landmarks
  timestamp?: number;
}

export interface InitOptions {
  videoEl: HTMLVideoElement;
  canvasEl: HTMLCanvasElement;
}

export interface FilterMeta {
  path: string; // glb path
  name?: string;
  author?: string;
  license?: string;
  scale?: number;
  offset?: Vector3;
}

export interface IFaceFilters {
  init(opts: Partial<InitOptions>): Promise<boolean>;
  enable(): Promise<boolean>;
  disable(): Promise<boolean>;
  setFilter(glbPath: string): Promise<boolean>;
  destroy(): Promise<void>;
}

export {};
