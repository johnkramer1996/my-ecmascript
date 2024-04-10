import IExpression from './IExpression'
import IStatement from './IStatement'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import { ResolveBinding } from 'parser/lib/spec/9.4'
import { InitializeReferencedBinding } from './Identifier'
import { GetValue, getNC } from 'parser/lib/spec/6.2'
import { IsAnonymousFunctionDefinition } from 'parser/lib/spec/8.4'

export class LexicalDeclarator implements IStatement {
  constructor(public id: IAccessible, public initializer: IExpression | null) {}

  public execute(): void {
    if (this.initializer === null) {
      // 1. Let lhs be ! ResolveBinding(StringValue of BindingIdentifier).
      const lhs = ResolveBinding(this.id.toString())['[[Value]]']
      // 2. Perform ! InitializeReferencedBinding(lhs, undefined).
      InitializeReferencedBinding(lhs, UndefinedType.UNDEFINED)
      // 3. Return EMPTY.
      return
    }

    // 1. Let bindingId be StringValue of BindingIdentifier.
    const bindingId = this.id.toString()
    // 2. Let lhs be ! ResolveBinding(bindingId).
    const lhs = ResolveBinding(bindingId)['[[Value]]']
    // 3. If IsAnonymousFunctionDefinition(Initializer) is true, then
    if (IsAnonymousFunctionDefinition(this.initializer)) {
      // a. Let value be ? NamedEvaluation of Initializer with argument bindingId.
      // let value = NamedEvaluation(this.initializer, bindingId)
    }
    // 4. Else,
    // a. Let rhs be ? Evaluation of Initializer.
    const rhs = this.initializer.eval()
    // b. Let value be ? GetValue(rhs).
    const value = getNC(GetValue(rhs))['[[Value]]']
    // 5. Perform ! InitializeReferencedBinding(lhs, value).
    InitializeReferencedBinding(lhs, value)
    // 6. Return EMPTY.
    // return 'EMPTY'
  }

  public hoisting(kind: string): void {
    this.id.hoisting(kind)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.id} = ${this.initializer}`
  }
}

export class LexicalDeclaration implements IStatement {
  constructor(public declarations: LexicalDeclarator[], public letOrConst: 'let' | 'const') {}

  public execute(): void {
    for (const decl of this.declarations) {
      decl.execute()
    }
  }

  public hoisting(): void {
    for (const decl of this.declarations) decl.hoisting(this.letOrConst)
  }

  // 8.2.3 Static Semantics: IsConstantDeclaration
  public IsConstantDeclaration() {
    return this.letOrConst === 'const'
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.letOrConst} ${this.declarations}`
  }
}
