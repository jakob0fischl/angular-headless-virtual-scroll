export interface Area {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export function overlaps(a: Area, b: Area): boolean {
  return a.top <= b.bottom && a.bottom >= b.top && a.left <= b.right && a.right >= b.left;
}
