import IVisitor from './IVisitor'

export interface INode {
  // start: number
  // end: number
  accept(visitor: IVisitor): void
  toString(): string
}
