import IExpression from 'parser/ast/IExpression'

// 8.4.1 Static Semantics: HasName
function hasName() {
  // 1. Let expr be the ParenthesizedExpression that is covered by CoverParenthesizedExpressionAndArrowParameterList.
  // 2. If IsFunctionDefinition of expr is false, return false.
  // 3. Return HasName of expr.
}

// 8.4.2 Static Semantics: IsFunctionDefinition
function IsFunctionDefinition() {
  // 1. Let expr be the ParenthesizedExpression that is covered by CoverParenthesizedExpressionAndArrowParameterList.
  // const expr =
  // 2. Return IsFunctionDefinition of expr.
  return false
}

// 8.4.3 Static Semantics: IsAnonymousFunctionDefinition ( expr )
export function IsAnonymousFunctionDefinition(expr: IExpression) {
  // 1. If IsFunctionDefinition of expr is false, return false.
  if (IsFunctionDefinition() === false) return false
  // 2. Let hasName be HasName of expr.
  const hasName = expr
  // 3. If hasName is true, return false.
  //   if (hasName === true) return false
  // 4. Return true.
  return true
}

// 8.4.5 Runtime Semantics: NamedEvaluation
