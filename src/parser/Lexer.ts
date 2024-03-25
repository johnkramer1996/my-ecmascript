import LexerException from 'exceptions/LexerException'
import Token, { IToken } from './Token'
import TokenType from './TokenType'

export interface ILexer {
  tokenize(): IToken[]
}

export default class Lexer implements ILexer {
  private static OPERATORS = new Map([
    ['+', TokenType.PLUS],
    ['-', TokenType.MINUS],
    ['*', TokenType.STAR],
    ['/', TokenType.SLASH],
    ['%', TokenType.PERCENT],
    ['!', TokenType.EXCL],
    ['^', TokenType.CARET],
    ['~', TokenType.TILDE],
    ['?', TokenType.QUESTION],
    [':', TokenType.COLON],
    ['&', TokenType.AMP],
    ['|', TokenType.BAR],
    ['=', TokenType.EQ],
    ['<', TokenType.LT],
    ['>', TokenType.GT],
    ['==', TokenType.EQEQ],
    ['!=', TokenType.EXCLEQ],
    ['<=', TokenType.LTEQ],
    ['>=', TokenType.GTEQ],

    ['+=', TokenType.PLUSEQ],
    ['-=', TokenType.MINUSEQ],
    ['*=', TokenType.STAREQ],
    ['/=', TokenType.SLASHEQ],
    ['%=', TokenType.PERCENTEQ],
    ['&=', TokenType.AMPEQ],
    ['^=', TokenType.CARETEQ],
    ['|=', TokenType.BAREQ],
    ['<<=', TokenType.LTLTEQ],
    ['>>=', TokenType.GTGTEQ],
    ['>>>=', TokenType.GTGTGTEQ],

    ['++', TokenType.PLUSPLUS],
    ['--', TokenType.MINUSMINUS],

    ['&&', TokenType.AMPAMP],
    ['||', TokenType.BARBAR],
    ['<<', TokenType.LTLT],
    ['>>', TokenType.GTGT],
    ['>>>', TokenType.GTGTGT],
    ['(', TokenType.LPAREN],
    [')', TokenType.RPAREN],
    ['[', TokenType.LBRACKET],
    [']', TokenType.RBRACKET],
    ['{', TokenType.LBRACE],
    ['}', TokenType.RBRACE],
    ['.', TokenType.DOT],
    [',', TokenType.COMMA],
    ['=>', TokenType.ARROW],
  ])
  private static OPERATOR_CHARS = '+-*/%()[]{}=<>!&|.,^~?:'
  private static SINGLE_OR_DOUBLE_QUOTE = ["'", '"']
  public static KEYWORDS = new Map([
    ['log', TokenType.LOG],
    ['var', TokenType.VAR],
    ['const', TokenType.CONST],
    ['let', TokenType.LET],
    ['function', TokenType.FUNCTION],
    ['return', TokenType.RETURN],
    ['new', TokenType.NEW],
    ['class', TokenType.CLASS],
    ['constructor', TokenType.CONSTRUCTOR],
    ['this', TokenType.THIS],
    ['static', TokenType.STATIC],
  ])

  private tokens: IToken[] = []
  private text: string
  private length: number
  private position = 0
  private row = 1
  private col = 1
  private start = 0

  constructor(text: string) {
    this.text = text
    this.length = text.length
  }

  public tokenize(): IToken[] {
    try {
      while (this.position < this.length) {
        const char = this.peek()
        if (this.isWhiteSpace(char)) this.next()
        else {
          this.start = this.position
          if (this.isSemikolon(char)) this.tokenizeSemikolon()
          else if (this.isLetter(char) || ['_', '$'].includes(char)) this.tokenizeWord()
          else if (this.isDigit(char)) this.tokenizeNumber()
          else if (this.isOctothorp(char)) this.tokenizeHexNumber()
          else if (this.isBackTick(char)) this.tokenizeBackTick()
          else if (this.isQuote(char)) this.tokenizeText()
          else if (this.isOperator(char)) this.tokenizeOperator()
          else throw this.error(`Unknown char "${this.peek()}"`)
        }
      }
    } catch (e) {
      if (e instanceof LexerException) {
        console.error(`${e.name}: ${e.message}`, e.row, e.col)
      } else {
        console.error(e)
      }
    }
    return this.tokens
  }

  public isWhiteSpace(char: string): boolean {
    return [' ', '\n', '\t', '\r'].includes(char)
  }

  private isSemikolon(char: string): boolean {
    return char === ';'
  }

  private isDigit(char: string): boolean {
    const n = char.charCodeAt(0)
    return n >= 48 && n < 58
  }

  public isLetter(char: string): boolean {
    const n = char.charCodeAt(0)
    return (n >= 65 && n < 91) || (n >= 97 && n < 123)
  }

  private isQuote(char: string): boolean {
    return Lexer.SINGLE_OR_DOUBLE_QUOTE.includes(char)
  }

  private isOctothorp(char: string): boolean {
    return char === '#'
  }

  private isBackTick(char: string): boolean {
    return char === '`'
  }

  private isHexNumber(char: string): boolean {
    return !!~'abcdef'.indexOf(char.toLowerCase())
  }

  private isOperator(char: string): boolean {
    return Lexer.OPERATOR_CHARS.includes(char)
  }

  private tokenizeSemikolon(): void {
    this.next()
    this.addToken(TokenType.SEMIKOLON, ';')
  }

  private tokenizeWord(): void {
    const word = this.getNextChars(
      (current) => this.isLetter(current) || this.isDigit(current) || ['_', '$'].includes(current),
    )
    this.addToken(Lexer.KEYWORDS.get(word) ?? TokenType.WORD, word)
  }

  private tokenizeNumber(): void {
    let hasDot = false
    const number = this.getNextChars((current) => {
      const isDot = current === '.'
      if (isDot) {
        // if (hasDot) throw this.error('Invalid float number')
        if (hasDot) return false
        hasDot = true
      }
      return isDot || this.isDigit(current)
    })
    this.addToken(TokenType.NUMBER, number[number.length - 1] === '.' ? number.slice(0, -1) : number)
  }

  private tokenizeHexNumber(): void {
    this.next() // skip #
    const hexNumber = this.getNextChars((char) => this.isDigit(char) || this.isHexNumber(char))
    this.addToken(TokenType.HEX_NUMBER, hexNumber)
  }

  private tokenizeBackTick(): void {
    this.next() // skip `
    const result = this.getNextChars((current) => {
      if (current === '\0') throw this.error('Unterminated string literal')
      if (current === '\n' || current == '\r') throw this.error('Unterminated string literal')
      return !(current === '`')
    })
    this.addToken(TokenType.TEXT, result, `\`${result}\``)
  }

  private tokenizeText(): void {
    const singleOrDoubleQuote = this.peek()
    const buffer: string[] = []

    for (let current: string; (current = this.next()) !== singleOrDoubleQuote; ) {
      if (current === '\\') {
        current = this.next()
        const escape = [
          { char: '"', escape: '"' },
          { char: '0', escape: '\0' },
          { char: 'b', escape: '\b' },
          { char: 'f', escape: '\f' },
          { char: 'n', escape: '\n' },
          { char: 't', escape: '\t' },
        ].find(({ char }) => char === current)

        buffer.push(escape ? escape.escape : '\\')
        continue
      }
      buffer.push(current)

      const next = this.peek(1)
      if (next === '\0' || next === '\n') {
        const text = buffer.join('')
        const raw = `${singleOrDoubleQuote}${text}`
        this.position = this.length
        this.addToken(TokenType.TEXT, text, raw)
        throw this.error('Unterminated string literal')
      }
    }

    this.next()
    const text = buffer.join('')
    const raw = `${singleOrDoubleQuote}${text}${singleOrDoubleQuote}`
    this.addToken(TokenType.TEXT, text, raw)
  }

  private tokenizeOperator(): void {
    let current = this.peek()
    if (current === '/') {
      const next = this.peek(1)
      if (next === '/' || next === '*') {
        this.next()
        next === '/' ? this.tokenizeComment() : this.tokenizeMultilineComment()
        return
      }
    }
    const buffer: string[] = []
    while (true) {
      buffer.push(current)
      const text = buffer.join('')
      current = this.next()
      if (!Lexer.OPERATORS.has(text + current)) {
        if (!Lexer.OPERATORS.has(text)) throw this.error(`Token ${text} not found`)
        this.addToken(Lexer.OPERATORS.get(text) as TokenType, text)
        return
      }
    }
  }

  private tokenizeComment(): void {
    while (!'\r\n\0'.includes(this.next()));
  }

  private tokenizeMultilineComment(): void {
    while (true) {
      let current = this.next()
      if (current === '\0') throw this.error('Reached end of file while parsing multiline comment')
      if (current === '*' && this.peek(1) == '/') {
        this.next()
        this.next()
        return
      }
    }
  }

  private getNextChars(condition: (char: string) => boolean): string {
    const buffer = []
    let current = this.peek()
    do {
      buffer.push(current)
      current = this.next()
    } while (condition(current))
    return buffer.join('')
  }

  private next() {
    this.position++
    const result = this.peek(0)
    if (!(result === '\n')) this.col++
    else {
      this.row++
      this.col = 1
    }
    return result
  }

  private peek(relativePos = 0): string {
    const position = this.position + relativePos
    if (position >= this.length) return '\0'
    return this.text[position]
  }

  private addToken(type: TokenType, text = '', raw = text): void {
    this.tokens.push(new Token(type, text, raw, this.row, this.col, this.start, this.position))
    this.start = this.position
  }

  private error(text: string): Error {
    return new LexerException(text, this.row, this.col)
  }
}
