import { Location } from 'parser/Parser'
import IVisitor from './IVisitor'

export interface INode {
  // start: number
  // end: number
  accept(visitor: IVisitor): void
}
