/*!
 * chessboard.js v1.0.0
 * https://github.com/oakmac/chessboardjs/
 *
 * Copyright (c) 2019, Chris Oakman
 * Released under the MIT license
 */

;(function () {
  'use strict'

  var $ = window['jQuery']

  // Check for jQuery
  if (!$) {
    // Create minimal jQuery-like object
    $ = function(selector) {
      if (typeof selector === 'string') {
        if (selector.charAt(0) === '<') {
          // Create element
          var div = document.createElement('div')
          div.innerHTML = selector
          return new jQueryLite(div.firstChild ? [div.firstChild] : [])
        }
        var elements = document.querySelectorAll(selector)
        return new jQueryLite(Array.prototype.slice.call(elements))
      } else if (selector.nodeType) {
        return new jQueryLite([selector])
      } else if (selector instanceof jQueryLite) {
        return selector
      }
      return new jQueryLite([])
    }

    function jQueryLite(elements) {
      this.length = elements.length
      for (var i = 0; i < elements.length; i++) {
        this[i] = elements[i]
      }
    }

    jQueryLite.prototype.each = function(callback) {
      for (var i = 0; i < this.length; i++) {
        callback.call(this[i], i, this[i])
      }
      return this
    }

    jQueryLite.prototype.find = function(selector) {
      var results = []
      this.each(function() {
        var found = this.querySelectorAll(selector)
        for (var i = 0; i < found.length; i++) {
          results.push(found[i])
        }
      })
      return new jQueryLite(results)
    }

    jQueryLite.prototype.append = function(content) {
      if (typeof content === 'string') {
        this.each(function() {
          this.insertAdjacentHTML('beforeend', content)
        })
      } else if (content instanceof jQueryLite) {
        var self = this
        content.each(function() {
          if (self[0]) self[0].appendChild(this)
        })
      } else if (content.nodeType) {
        if (this[0]) this[0].appendChild(content)
      }
      return this
    }

    jQueryLite.prototype.html = function(content) {
      if (content === undefined) {
        return this[0] ? this[0].innerHTML : ''
      }
      this.each(function() {
        this.innerHTML = content
      })
      return this
    }

    jQueryLite.prototype.empty = function() {
      this.each(function() {
        this.innerHTML = ''
      })
      return this
    }

    jQueryLite.prototype.remove = function() {
      this.each(function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this)
        }
      })
      return this
    }

    jQueryLite.prototype.css = function(prop, value) {
      if (typeof prop === 'object') {
        var self = this
        Object.keys(prop).forEach(function(key) {
          self.css(key, prop[key])
        })
        return this
      }
      if (value === undefined) {
        return this[0] ? getComputedStyle(this[0])[prop] : ''
      }
      this.each(function() {
        this.style[prop] = value
      })
      return this
    }

    jQueryLite.prototype.attr = function(name, value) {
      if (value === undefined) {
        return this[0] ? this[0].getAttribute(name) : ''
      }
      this.each(function() {
        this.setAttribute(name, value)
      })
      return this
    }

    jQueryLite.prototype.addClass = function(className) {
      this.each(function() {
        this.classList.add(className)
      })
      return this
    }

    jQueryLite.prototype.removeClass = function(className) {
      this.each(function() {
        this.classList.remove(className)
      })
      return this
    }

    jQueryLite.prototype.hasClass = function(className) {
      return this[0] ? this[0].classList.contains(className) : false
    }

    jQueryLite.prototype.width = function(value) {
      if (value === undefined) {
        return this[0] ? this[0].offsetWidth : 0
      }
      this.each(function() {
        this.style.width = typeof value === 'number' ? value + 'px' : value
      })
      return this
    }

    jQueryLite.prototype.height = function(value) {
      if (value === undefined) {
        return this[0] ? this[0].offsetHeight : 0
      }
      this.each(function() {
        this.style.height = typeof value === 'number' ? value + 'px' : value
      })
      return this
    }

    jQueryLite.prototype.offset = function() {
      if (!this[0]) return { top: 0, left: 0 }
      var rect = this[0].getBoundingClientRect()
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      }
    }

    jQueryLite.prototype.on = function(event, selector, handler) {
      if (typeof selector === 'function') {
        handler = selector
        selector = null
      }
      this.each(function() {
        if (selector) {
          var self = this
          this.addEventListener(event, function(e) {
            var target = e.target.closest(selector)
            if (target && self.contains(target)) {
              handler.call(target, e)
            }
          })
        } else {
          this.addEventListener(event, handler)
        }
      })
      return this
    }

    jQueryLite.prototype.off = function(event) {
      // Simple implementation - doesn't track handlers
      return this
    }

    $.isFunction = function(obj) {
      return typeof obj === 'function'
    }

    $.isPlainObject = function(obj) {
      return Object.prototype.toString.call(obj) === '[object Object]'
    }
  }

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  var COLUMNS = 'abcdefgh'.split('')
  var DEFAULT_DRAG_THROTTLE_RATE = 20
  var ELLIPSIS = '...'
  var MINIMUM_JQUERY_VERSION = '1.8.3'
  var RUN_ASSERTS = false
  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  var START_POSITION = fenToObj(START_FEN)

  // default animation speeds
  var DEFAULT_APPEAR_SPEED = 200
  var DEFAULT_MOVE_SPEED = 200
  var DEFAULT_SNAPBACK_SPEED = 60
  var DEFAULT_SNAP_SPEED = 30
  var DEFAULT_TRASH_SPEED = 100

  // use unique class names to prevent clashing with anything else on the page
  // and simplify selectors
  var CSS = {
    alpha: 'alpha-d2270',
    black: 'black-3c85d',
    board: 'board-b72b1',
    chessboard: 'chessboard-63f37',
    clearfix: 'clearfix-7da63',
    highlight1: 'highlight1-32417',
    highlight2: 'highlight2-9c5d2',
    notation: 'notation-322f9',
    numeric: 'numeric-fc462',
    piece: 'piece-417db',
    row: 'row-5277c',
    sparePieces: 'spare-pieces-7492f',
    sparePiecesBottom: 'spare-pieces-bottom-ae20f',
    sparePiecesTop: 'spare-pieces-top-4028b',
    square: 'square-55d63',
    white: 'white-1e1d7'
  }

  // ---------------------------------------------------------------------------
  // Misc Util Functions
  // ---------------------------------------------------------------------------

  function throttle (f, interval, scope) {
    var timeout = 0
    var shouldFire = false
    var args = []

    var handleTimeout = function () {
      timeout = 0
      if (shouldFire) {
        shouldFire = false
        fire()
      }
    }

    var fire = function () {
      timeout = window.setTimeout(handleTimeout, interval)
      f.apply(scope, args)
    }

    return function (_args) {
      args = arguments
      if (!timeout) {
        fire()
      } else {
        shouldFire = true
      }
    }
  }

  function uuid () {
    return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
      var r = (Math.random() * 16) | 0
      return r.toString(16)
    })
  }

  function deepCopy (thing) {
    return JSON.parse(JSON.stringify(thing))
  }

  function interpolateTemplate (str, obj) {
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      var keyTemplateStr = '{' + key + '}'
      var value = obj[key]
      while (str.indexOf(keyTemplateStr) !== -1) {
        str = str.replace(keyTemplateStr, value)
      }
    }
    return str
  }

  // ---------------------------------------------------------------------------
  // Predicates
  // ---------------------------------------------------------------------------

  function isString (s) {
    return typeof s === 'string'
  }

  function isFunction (f) {
    return typeof f === 'function'
  }

  function isInteger (n) {
    return typeof n === 'number' &&
           isFinite(n) &&
           Math.floor(n) === n
  }

  function validAnimationSpeed (speed) {
    if (speed === 'fast' || speed === 'slow') return true
    if (!isInteger(speed)) return false
    return speed >= 0
  }

  function validThrottleRate (rate) {
    return isInteger(rate) && rate >= 1
  }

  function validMove (move) {
    if (!isString(move)) return false
    var squares = move.split('-')
    if (squares.length !== 2) return false
    return validSquare(squares[0]) && validSquare(squares[1])
  }

  function validSquare (square) {
    return isString(square) && square.search(/^[a-h][1-8]$/) !== -1
  }

  function validPieceCode (code) {
    return isString(code) && code.search(/^[bw][KQRNBP]$/) !== -1
  }

  function validFen (fen) {
    if (!isString(fen)) return false
    var chunks = fen.replace(/ .+$/, '').split('/')
    if (chunks.length !== 8) return false
    for (var i = 0; i < 8; i++) {
      if (chunks[i].length === 0 ||
          chunks[i].length > 8 ||
          chunks[i].search(/[^kqrnbpKQRNBP1-8]/) !== -1) {
        return false
      }
    }
    return true
  }

  function validPositionObject (pos) {
    if (!$.isPlainObject(pos)) return false
    for (var i in pos) {
      if (!pos.hasOwnProperty(i)) continue
      if (!validSquare(i) || !validPieceCode(pos[i])) {
        return false
      }
    }
    return true
  }

  function isTouchDevice () {
    return 'ontouchstart' in document.documentElement
  }

  // ---------------------------------------------------------------------------
  // Chess Util Functions
  // ---------------------------------------------------------------------------

  function fenToPieceCode (piece) {
    if (piece.toLowerCase() === piece) {
      return 'b' + piece.toUpperCase()
    }
    return 'w' + piece.toUpperCase()
  }

  function pieceCodeToFen (piece) {
    var pieceCodeLetters = piece.split('')
    if (pieceCodeLetters[0] === 'w') {
      return pieceCodeLetters[1].toUpperCase()
    }
    return pieceCodeLetters[1].toLowerCase()
  }

  function fenToObj (fen) {
    if (!validFen(fen)) return false
    fen = fen.replace(/ .+$/, '')
    var rows = fen.split('/')
    var position = {}

    var currentRow = 8
    for (var i = 0; i < 8; i++) {
      var row = rows[i].split('')
      var colIdx = 0
      for (var j = 0; j < row.length; j++) {
        if (row[j].search(/[1-8]/) !== -1) {
          colIdx = colIdx + parseInt(row[j], 10)
        } else {
          var square = COLUMNS[colIdx] + currentRow
          position[square] = fenToPieceCode(row[j])
          colIdx = colIdx + 1
        }
      }
      currentRow = currentRow - 1
    }

    return position
  }

  function objToFen (obj) {
    if (!validPositionObject(obj)) return false
    var fen = ''
    var currentRow = 8
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var square = COLUMNS[j] + currentRow
        if (obj.hasOwnProperty(square)) {
          fen = fen + pieceCodeToFen(obj[square])
        } else {
          fen = fen + '1'
        }
      }
      if (i !== 7) {
        fen = fen + '/'
      }
      currentRow = currentRow - 1
    }
    fen = fen.replace(/11111111/g, '8')
    fen = fen.replace(/1111111/g, '7')
    fen = fen.replace(/111111/g, '6')
    fen = fen.replace(/11111/g, '5')
    fen = fen.replace(/1111/g, '4')
    fen = fen.replace(/111/g, '3')
    fen = fen.replace(/11/g, '2')
    return fen
  }

  window['Chessboard'] = window['Chessboard'] || function (containerElOrString, config) {
    if (arguments.length === 0) {
      var rv = {}
      rv.fenToObj = fenToObj
      rv.objToFen = objToFen
      return rv
    }

    // ensure the config object is what we expect
    if (!config) config = {}

    // DOM elements
    var $container = null
    var $board = null
    var $draggedPiece = null
    var $sparePiecesTop = null
    var $sparePiecesBottom = null

    // constructor return object
    var widget = {}

    // -------------------------------------------------------------------------
    // Stateful
    // -------------------------------------------------------------------------

    var boardBorderSize = 2
    var currentOrientation = 'white'
    var currentPosition = {}
    var draggedPiece = null
    var draggedPieceLocation = null
    var draggedPieceSource = null
    var isDragging = false
    var sparePiecesElsIds = {}
    var squareElsIds = {}
    var squareElsOffsets = {}
    var squareSize = 16

    // -------------------------------------------------------------------------
    // Validation / Errors
    // -------------------------------------------------------------------------

    function error (code, msg, obj) {
      if (config.hasOwnProperty('showErrors') &&
          config.showErrors === false) {
        return
      }

      var errorText = 'Chessboard Error ' + code + ': ' + msg

      if (config.showErrors === 'console' &&
          typeof console === 'object' &&
          typeof console.log === 'function') {
        console.log(errorText)
        if (arguments.length >= 2) {
          console.log(obj)
        }
        return
      }

      if (config.showErrors === 'alert') {
        if (obj) {
          errorText += '\n\n' + JSON.stringify(obj)
        }
        window.alert(errorText)
        return
      }

      if (isFunction(config.showErrors)) {
        config.showErrors(code, msg, obj)
      }
    }

    function setInitialState () {
      currentOrientation = config.orientation || 'white'
      currentPosition = {}
      draggedPiece = null
      draggedPieceLocation = null
      draggedPieceSource = null
      isDragging = false
      sparePiecesElsIds = {}
      squareElsIds = {}
      squareElsOffsets = {}
    }

    // -------------------------------------------------------------------------
    // DOM Misc
    // -------------------------------------------------------------------------

    function calculateSquareSize () {
      var containerWidth = parseInt($container.width(), 10)

      if (!containerWidth || containerWidth <= 0) {
        return 0
      }

      var boardWidth = containerWidth - 1
      while (boardWidth % 8 !== 0 && boardWidth > 0) {
        boardWidth = boardWidth - 1
      }

      return boardWidth / 8
    }

    function createElIds () {
      for (var i = 0; i < COLUMNS.length; i++) {
        for (var j = 1; j <= 8; j++) {
          var square = COLUMNS[i] + j
          squareElsIds[square] = square + '-' + uuid()
        }
      }

      var pieces = 'KQRNBP'.split('')
      for (i = 0; i < pieces.length; i++) {
        var whitePiece = 'w' + pieces[i]
        var blackPiece = 'b' + pieces[i]
        sparePiecesElsIds[whitePiece] = whitePiece + '-' + uuid()
        sparePiecesElsIds[blackPiece] = blackPiece + '-' + uuid()
      }
    }

    // -------------------------------------------------------------------------
    // Markup Building
    // -------------------------------------------------------------------------

    function buildBoardHTML (orientation) {
      if (orientation !== 'black') {
        orientation = 'white'
      }

      var html = ''

      var alpha = deepCopy(COLUMNS)
      var row = 8
      if (orientation === 'black') {
        alpha.reverse()
        row = 1
      }

      var squareColor = 'white'
      for (var i = 0; i < 8; i++) {
        html += '<div class="' + CSS.row + '">'
        for (var j = 0; j < 8; j++) {
          var square = alpha[j] + row

          html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' +
            'square-' + square + '" ' +
            'style="width:' + squareSize + 'px;height:' + squareSize + 'px;" ' +
            'id="' + squareElsIds[square] + '" ' +
            'data-square="' + square + '">'

          if (config.showNotation) {
            if ((orientation === 'white' && row === 1) ||
                (orientation === 'black' && row === 8)) {
              html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' +
                alpha[j] + '</div>'
            }
            if (j === 0) {
              html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' +
                row + '</div>'
            }
          }

          html += '</div>'

          squareColor = squareColor === 'white' ? 'black' : 'white'
        }
        html += '<div class="' + CSS.clearfix + '"></div></div>'

        squareColor = squareColor === 'white' ? 'black' : 'white'

        if (orientation === 'white') {
          row = row - 1
        } else {
          row = row + 1
        }
      }

      return html
    }

    function buildPieceImgSrc (piece) {
      if (isFunction(config.pieceTheme)) {
        return config.pieceTheme(piece)
      }

      if (isString(config.pieceTheme)) {
        return interpolateTemplate(config.pieceTheme, { piece: piece })
      }

      error(8272, 'Unable to build image source for config.pieceTheme.')
      return ''
    }

    function buildPieceHTML (piece, hidden, id) {
      var html = '<img src="' + buildPieceImgSrc(piece) + '" '
      if (isString(id) && id !== '') {
        html += 'id="' + id + '" '
      }
      html += 'alt="" ' +
        'class="' + CSS.piece + '" ' +
        'data-piece="' + piece + '" ' +
        'style="width:' + squareSize + 'px;' + 'height:' + squareSize + 'px;'

      if (hidden) {
        html += 'display:none;'
      }

      html += '" />'

      return html
    }

    function buildSparePiecesHTML (color) {
      var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP']
      if (color === 'black') {
        pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP']
      }

      var html = ''
      for (var i = 0; i < pieces.length; i++) {
        html += buildPieceHTML(pieces[i], false, sparePiecesElsIds[pieces[i]])
      }

      return html
    }

    // -------------------------------------------------------------------------
    // Animations
    // -------------------------------------------------------------------------

    function animateSquareToSquare (src, dest, piece, completeFn) {
      var $srcSquare = $('#' + squareElsIds[src])
      var srcSquarePosition = $srcSquare.offset()
      var $destSquare = $('#' + squareElsIds[dest])
      var destSquarePosition = $destSquare.offset()

      var animatedPieceId = uuid()
      $('body').append(buildPieceHTML(piece, true, animatedPieceId))
      var $animatedPiece = $('#' + animatedPieceId)

      $animatedPiece.css({
        display: '',
        position: 'absolute',
        top: srcSquarePosition.top,
        left: srcSquarePosition.left
      })

      $srcSquare.find('.' + CSS.piece).css('display', 'none')

      function onFinishAnimation1 () {
        $animatedPiece.remove()
        drawPositionInstant()
        if (isFunction(completeFn)) {
          completeFn()
        }
      }

      var animConfig = {
        duration: config.moveSpeed,
        complete: onFinishAnimation1
      }

      $animatedPiece.animate(destSquarePosition, animConfig)
    }

    function animateSparePieceToSquare (piece, dest, completeFn) {
      var srcOffset = $('#' + sparePiecesElsIds[piece]).offset()
      var $destSquare = $('#' + squareElsIds[dest])
      var destOffset = $destSquare.offset()

      var pieceId = uuid()
      $('body').append(buildPieceHTML(piece, true, pieceId))
      var $animatedPiece = $('#' + pieceId)

      $animatedPiece.css({
        display: '',
        position: 'absolute',
        left: srcOffset.left,
        top: srcOffset.top
      })

      function onFinishAnimation2 () {
        $animatedPiece.remove()
        drawPositionInstant()
        if (isFunction(completeFn)) {
          completeFn()
        }
      }

      var animConfig = {
        duration: config.moveSpeed,
        complete: onFinishAnimation2
      }

      $animatedPiece.animate(destOffset, animConfig)
    }

    function doAnimations (animations, oldPos, newPos) {
      if (animations.length === 0) {
        drawPositionInstant()
        return
      }

      var numFinished = 0
      function onFinished () {
        numFinished = numFinished + 1
        if (numFinished === animations.length) {
          drawPositionInstant()
          if (isFunction(config.onMoveEnd)) {
            config.onMoveEnd(deepCopy(oldPos), deepCopy(newPos))
          }
        }
      }

      for (var i = 0; i < animations.length; i++) {
        var animation = animations[i]
        if (animation.type === 'clear') {
          $('#' + squareElsIds[animation.square] + ' .' + CSS.piece)
            .fadeOut(config.trashSpeed, onFinished)
        } else if (animation.type === 'add' && !config.sparePieces) {
          $('#' + squareElsIds[animation.square])
            .append(buildPieceHTML(animation.piece, true))
            .find('.' + CSS.piece)
            .fadeIn(config.appearSpeed, onFinished)
        } else if (animation.type === 'add' && config.sparePieces) {
          animateSparePieceToSquare(animation.piece, animation.square, onFinished)
        } else if (animation.type === 'move') {
          animateSquareToSquare(animation.source, animation.destination, animation.piece, onFinished)
        }
      }
    }

    function squareDistance (s1, s2) {
      var s1x = COLUMNS.indexOf(s1[0]) + 1
      var s1y = parseInt(s1[1], 10)
      var s2x = COLUMNS.indexOf(s2[0]) + 1
      var s2y = parseInt(s2[1], 10)
      var xDelta = Math.abs(s1x - s2x)
      var yDelta = Math.abs(s1y - s2y)
      if (xDelta >= yDelta) return xDelta
      return yDelta
    }

    function createRadius (square) {
      var squares = []
      var i, j, s

      for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
          s = COLUMNS[i] + (j + 1)
          if (square === s) continue
          squares.push({
            square: s,
            distance: squareDistance(square, s)
          })
        }
      }

      squares.sort(function (a, b) {
        return a.distance - b.distance
      })

      var surroundingSquares = []
      for (i = 0; i < squares.length; i++) {
        surroundingSquares.push(squares[i].square)
      }

      return surroundingSquares
    }

    function findClosestPiece (position, piece, square) {
      var closestSquares = createRadius(square)
      for (var i = 0; i < closestSquares.length; i++) {
        var s = closestSquares[i]
        if (position.hasOwnProperty(s) && position[s] === piece) {
          return s
        }
      }
      return false
    }

    function calculateAnimations (pos1, pos2) {
      pos1 = deepCopy(pos1)
      pos2 = deepCopy(pos2)

      var animations = []
      var squaresMovedTo = {}

      for (var i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue
        if (pos1.hasOwnProperty(i) && pos1[i] === pos2[i]) {
          delete pos1[i]
          delete pos2[i]
        }
      }

      for (i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue
        var closestPiece = findClosestPiece(pos1, pos2[i], i)
        if (closestPiece) {
          animations.push({
            type: 'move',
            source: closestPiece,
            destination: i,
            piece: pos2[i]
          })
          delete pos1[closestPiece]
          delete pos2[i]
          squaresMovedTo[i] = true
        }
      }

      for (i in pos1) {
        if (!pos1.hasOwnProperty(i)) continue
        if (squaresMovedTo.hasOwnProperty(i)) continue
        animations.push({
          type: 'clear',
          square: i,
          piece: pos1[i]
        })
        delete pos1[i]
      }

      for (i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue
        animations.push({
          type: 'add',
          square: i,
          piece: pos2[i]
        })
        delete pos2[i]
      }

      return animations
    }

    // -------------------------------------------------------------------------
    // Control Flow
    // -------------------------------------------------------------------------

    function drawPositionInstant () {
      $board.find('.' + CSS.piece).remove()
      for (var i in currentPosition) {
        if (!currentPosition.hasOwnProperty(i)) continue
        $('#' + squareElsIds[i]).append(buildPieceHTML(currentPosition[i]))
      }
    }

    function drawBoard () {
      $board.html(buildBoardHTML(currentOrientation))
      drawPositionInstant()

      if (config.sparePieces) {
        if (currentOrientation === 'white') {
          $sparePiecesTop.html(buildSparePiecesHTML('black'))
          $sparePiecesBottom.html(buildSparePiecesHTML('white'))
        } else {
          $sparePiecesTop.html(buildSparePiecesHTML('white'))
          $sparePiecesBottom.html(buildSparePiecesHTML('black'))
        }
      }
    }

    function setCurrentPosition (position) {
      var oldPos = deepCopy(currentPosition)
      var newPos = deepCopy(position)
      var oldFen = objToFen(oldPos)
      var newFen = objToFen(newPos)

      if (oldFen === newFen) return

      if (isFunction(config.onChange)) {
        config.onChange(oldPos, newPos)
      }

      currentPosition = position
    }

    // -------------------------------------------------------------------------
    // Piece Drag / Drop
    // -------------------------------------------------------------------------

    function isXYOnSquare (x, y) {
      for (var i in squareElsOffsets) {
        if (!squareElsOffsets.hasOwnProperty(i)) continue
        var s = squareElsOffsets[i]
        if (x >= s.left &&
            x < s.left + squareSize &&
            y >= s.top &&
            y < s.top + squareSize) {
          return i
        }
      }
      return 'offboard'
    }

    function captureSquareOffsets () {
      squareElsOffsets = {}
      for (var i in squareElsIds) {
        if (!squareElsIds.hasOwnProperty(i)) continue
        squareElsOffsets[i] = $('#' + squareElsIds[i]).offset()
      }
    }

    function removeSquareHighlights () {
      $board
        .find('.' + CSS.square)
        .removeClass(CSS.highlight1 + ' ' + CSS.highlight2)
    }

    function highlightSquare (square) {
      var $square = $('#' + squareElsIds[square])
      $square.addClass(CSS.highlight2)
    }

    function snapbackDraggedPiece () {
      removeSquareHighlights()

      var sourceSquarePosition = $('#' + squareElsIds[draggedPieceSource]).offset()

      var animConfig = {
        duration: config.snapbackSpeed,
        complete: function () {
          drawPositionInstant()
          $draggedPiece.css('display', 'none')
          isDragging = false
        }
      }

      $draggedPiece.animate(sourceSquarePosition, animConfig)

      currentPosition[draggedPieceSource] = draggedPiece
      setCurrentPosition(currentPosition)
    }

    function trashDraggedPiece () {
      removeSquareHighlights()

      var newPosition = deepCopy(currentPosition)
      delete newPosition[draggedPieceSource]
      setCurrentPosition(newPosition)

      $draggedPiece.fadeOut(config.trashSpeed, function () {
        $draggedPiece.remove()
      })

      isDragging = false
    }

    function dropDraggedPieceOnSquare (square) {
      removeSquareHighlights()

      var newPosition = deepCopy(currentPosition)
      delete newPosition[draggedPieceSource]
      newPosition[square] = draggedPiece
      setCurrentPosition(newPosition)

      var targetSquarePosition = $('#' + squareElsIds[square]).offset()

      var animConfig = {
        duration: config.snapSpeed,
        complete: function () {
          drawPositionInstant()
          $draggedPiece.css('display', 'none')
          isDragging = false
        }
      }

      $draggedPiece.animate(targetSquarePosition, animConfig)
    }

    function beginDraggingPiece (source, piece, x, y) {
      if (isFunction(config.onDragStart) &&
          config.onDragStart(source, piece,
            deepCopy(currentPosition), currentOrientation) === false) {
        return
      }

      isDragging = true
      draggedPiece = piece
      draggedPieceSource = source

      if (source === 'spare') {
        draggedPieceLocation = 'offboard'
      } else {
        draggedPieceLocation = source
      }

      captureSquareOffsets()

      $draggedPiece.attr('src', buildPieceImgSrc(piece)).css({
        display: '',
        position: 'absolute',
        left: x - squareSize / 2,
        top: y - squareSize / 2
      })

      if (source !== 'spare') {
        $('#' + squareElsIds[source]).find('.' + CSS.piece).css('display', 'none')
      }
    }

    function updateDraggedPiece (x, y) {
      $draggedPiece.css({
        left: x - squareSize / 2,
        top: y - squareSize / 2
      })

      var location = isXYOnSquare(x, y)

      if (location !== draggedPieceLocation) {
        if (draggedPieceLocation !== 'offboard') {
          $('#' + squareElsIds[draggedPieceLocation]).removeClass(CSS.highlight2)
        }

        if (location !== 'offboard') {
          highlightSquare(location)
        }

        if (isFunction(config.onDragMove)) {
          config.onDragMove(
            location,
            draggedPieceLocation,
            draggedPieceSource,
            draggedPiece,
            deepCopy(currentPosition),
            currentOrientation
          )
        }

        draggedPieceLocation = location
      }
    }

    function stopDraggedPiece (location) {
      var newLocation = isXYOnSquare(location.x, location.y)

      var action = 'drop'
      if (isFunction(config.onDrop)) {
        var newPosition = deepCopy(currentPosition)
        if (draggedPieceSource === 'spare' && validSquare(newLocation)) {
          newPosition[newLocation] = draggedPiece
        }
        if (validSquare(draggedPieceSource) && newLocation === 'offboard') {
          delete newPosition[draggedPieceSource]
        }
        if (validSquare(draggedPieceSource) && validSquare(newLocation)) {
          delete newPosition[draggedPieceSource]
          newPosition[newLocation] = draggedPiece
        }

        var oldPosition = deepCopy(currentPosition)
        var result = config.onDrop(
          draggedPieceSource,
          newLocation,
          draggedPiece,
          newPosition,
          oldPosition,
          currentOrientation
        )
        if (result === 'snapback' || result === 'trash') {
          action = result
        }
      }

      if (action === 'snapback') {
        snapbackDraggedPiece()
      } else if (action === 'trash') {
        trashDraggedPiece()
      } else if (action === 'drop') {
        if (validSquare(newLocation)) {
          dropDraggedPieceOnSquare(newLocation)
        } else if (newLocation === 'offboard' && config.dropOffBoard === 'trash') {
          trashDraggedPiece()
        } else if (newLocation === 'offboard' && config.dropOffBoard === 'snapback') {
          snapbackDraggedPiece()
        } else if (newLocation === 'offboard') {
          snapbackDraggedPiece()
        }
      }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    widget.clear = function (useAnimation) {
      widget.position({}, useAnimation)
    }

    widget.destroy = function () {
      $container.html('')
      $draggedPiece.remove()

      $container.off('mousedown', '.' + CSS.square, mousedownSquare)
      $container.off('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece, mousedownSparePiece)
      document.body.removeEventListener('mousemove', mousemoveWindow)
      document.body.removeEventListener('mouseup', mouseupWindow)
      document.body.removeEventListener('touchmove', touchmoveWindow)
      document.body.removeEventListener('touchend', touchendWindow)
    }

    widget.fen = function () {
      return widget.position('fen')
    }

    widget.flip = function () {
      return widget.orientation('flip')
    }

    widget.move = function () {
      if (arguments.length === 0) return

      var useAnimation = true
      var moves = {}
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] === false) {
          useAnimation = false
          continue
        }
        if (validMove(arguments[i])) {
          var squares = arguments[i].split('-')
          moves[squares[0]] = squares[1]
        } else {
          error(2826, 'Invalid move passed to the move method.', arguments[i])
        }
      }

      var newPos = calculatePositionFromMoves(currentPosition, moves)
      widget.position(newPos, useAnimation)

      return newPos
    }

    widget.orientation = function (arg) {
      if (arguments.length === 0) {
        return currentOrientation
      }

      if (arg === 'white' || arg === 'black') {
        currentOrientation = arg
        drawBoard()
        return currentOrientation
      }

      if (arg === 'flip') {
        currentOrientation = currentOrientation === 'white' ? 'black' : 'white'
        drawBoard()
        return currentOrientation
      }

      error(5482, 'Invalid value passed to the orientation method.', arg)
    }

    widget.position = function (position, useAnimation) {
      if (arguments.length === 0) {
        return deepCopy(currentPosition)
      }

      if (isString(position) && position.toLowerCase() === 'fen') {
        return objToFen(currentPosition)
      }

      if (isString(position) && position.toLowerCase() === 'start') {
        position = deepCopy(START_POSITION)
      }

      if (validFen(position)) {
        position = fenToObj(position)
      }

      if (!validPositionObject(position)) {
        error(6482, 'Invalid value passed to the position method.', position)
        return
      }

      if (useAnimation === true) {
        var animations = calculateAnimations(currentPosition, position)
        doAnimations(animations, currentPosition, position)
      }

      setCurrentPosition(position)

      if (useAnimation !== true) {
        drawPositionInstant()
      }
    }

    widget.resize = function () {
      squareSize = calculateSquareSize()
      $board.css('width', squareSize * 8 + 'px')
      $draggedPiece.css({
        height: squareSize,
        width: squareSize
      })
      if (config.sparePieces) {
        $container
          .find('.' + CSS.sparePieces)
          .css('paddingLeft', squareSize + boardBorderSize + 'px')
      }
      drawBoard()
    }

    widget.start = function (useAnimation) {
      widget.position('start', useAnimation)
    }

    // -------------------------------------------------------------------------
    // Browser Events
    // -------------------------------------------------------------------------

    function stopDefault (evt) {
      evt.preventDefault()
    }

    function mousedownSquare (evt) {
      if (!config.draggable) return
      var square = $(this).attr('data-square')
      if (!validSquare(square)) return
      if (!currentPosition.hasOwnProperty(square)) return
      beginDraggingPiece(
        square,
        currentPosition[square],
        evt.pageX,
        evt.pageY
      )
    }

    function touchstartSquare (e) {
      if (!config.draggable) return
      var square = this.getAttribute('data-square')
      if (!validSquare(square)) return
      if (!currentPosition.hasOwnProperty(square)) return
      e = e.originalEvent
      beginDraggingPiece(
        square,
        currentPosition[square],
        e.changedTouches[0].pageX,
        e.changedTouches[0].pageY
      )
    }

    function mousedownSparePiece (evt) {
      if (!config.sparePieces) return
      var piece = $(this).attr('data-piece')
      beginDraggingPiece('spare', piece, evt.pageX, evt.pageY)
    }

    function touchstartSparePiece (e) {
      if (!config.sparePieces) return
      var piece = this.getAttribute('data-piece')
      e = e.originalEvent
      beginDraggingPiece(
        'spare',
        piece,
        e.changedTouches[0].pageX,
        e.changedTouches[0].pageY
      )
    }

    function mousemoveWindow (evt) {
      if (!isDragging) return
      updateDraggedPiece(evt.pageX, evt.pageY)
    }

    function throttledMousemoveWindow (evt) {
      mousemoveWindow(evt)
    }

    function touchmoveWindow (evt) {
      if (!isDragging) return
      evt.preventDefault()
      updateDraggedPiece(
        evt.changedTouches[0].pageX,
        evt.changedTouches[0].pageY
      )
    }

    function mouseupWindow (evt) {
      if (!isDragging) return
      stopDraggedPiece({ x: evt.pageX, y: evt.pageY })
    }

    function touchendWindow (evt) {
      if (!isDragging) return
      stopDraggedPiece({
        x: evt.changedTouches[0].pageX,
        y: evt.changedTouches[0].pageY
      })
    }

    function calculatePositionFromMoves (position, moves) {
      position = deepCopy(position)

      for (var i in moves) {
        if (!moves.hasOwnProperty(i)) continue
        if (!position.hasOwnProperty(i)) {
          error(5826, 'Invalid move passed to move method.', moves)
          return
        }
        var piece = position[i]
        delete position[i]
        position[moves[i]] = piece
      }

      return position
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    function addEvents () {
      $container.on('mousedown', '.' + CSS.square, mousedownSquare)
      $container.on('touchstart', '.' + CSS.square, touchstartSquare)
      $container.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece, mousedownSparePiece)
      $container.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece, touchstartSparePiece)

      document.body.addEventListener('mousemove', throttledMousemoveWindow)
      document.body.addEventListener('mouseup', mouseupWindow)
      document.body.addEventListener('touchmove', touchmoveWindow, { passive: false })
      document.body.addEventListener('touchend', touchendWindow)
    }

    function initDom () {
      $container = $(containerElOrString)
      if ($container.length !== 1) {
        error(2081, 'Chessboard constructor passed invalid container.', containerElOrString)
        return
      }

      var containerHTML = '<div class="' + CSS.chessboard + '">'
      if (config.sparePieces) {
        containerHTML += '<div class="' + CSS.sparePieces + ' ' +
          CSS.sparePiecesTop + '"></div>'
      }
      containerHTML += '<div class="' + CSS.board + '"></div>'
      if (config.sparePieces) {
        containerHTML += '<div class="' + CSS.sparePieces + ' ' +
          CSS.sparePiecesBottom + '"></div>'
      }
      containerHTML += '</div>'
      $container.html(containerHTML)

      $board = $container.find('.' + CSS.board)
      if (config.sparePieces) {
        $sparePiecesTop = $container.find('.' + CSS.sparePiecesTop)
        $sparePiecesBottom = $container.find('.' + CSS.sparePiecesBottom)
      }

      var draggedPieceId = uuid()
      $('body').append(buildPieceHTML('wP', true, draggedPieceId))
      $draggedPiece = $('#' + draggedPieceId)

      boardBorderSize = parseInt($board.css('borderLeftWidth'), 10)
      squareSize = calculateSquareSize()

      $board.css('width', squareSize * 8 + 'px')

      drawBoard()
    }

    function init () {
      if (typeof config.showErrors !== 'string' &&
          typeof config.showErrors !== 'function' &&
          config.showErrors !== false) {
        config.showErrors = 'console'
      }

      if (!validAnimationSpeed(config.appearSpeed)) {
        config.appearSpeed = DEFAULT_APPEAR_SPEED
      }
      if (!validAnimationSpeed(config.moveSpeed)) {
        config.moveSpeed = DEFAULT_MOVE_SPEED
      }
      if (!validAnimationSpeed(config.snapbackSpeed)) {
        config.snapbackSpeed = DEFAULT_SNAPBACK_SPEED
      }
      if (!validAnimationSpeed(config.snapSpeed)) {
        config.snapSpeed = DEFAULT_SNAP_SPEED
      }
      if (!validAnimationSpeed(config.trashSpeed)) {
        config.trashSpeed = DEFAULT_TRASH_SPEED
      }

      if (!validThrottleRate(config.dragThrottleRate)) {
        config.dragThrottleRate = DEFAULT_DRAG_THROTTLE_RATE
      }
      throttledMousemoveWindow = throttle(mousemoveWindow, config.dragThrottleRate)

      setInitialState()
      createElIds()
      initDom()
      addEvents()

      if (config.position) {
        if (isString(config.position) && config.position.toLowerCase() === 'start') {
          widget.start(false)
        } else if (validFen(config.position)) {
          widget.position(config.position, false)
        } else if (validPositionObject(config.position)) {
          widget.position(config.position, false)
        } else {
          error(7263, 'Invalid value passed to config.position.', config.position)
        }
      }

      return widget
    }

    return init()
  }

  window['Chessboard'] = window['Chessboard'] || window['Chessboard']
  window['Chessboard']['fenToObj'] = fenToObj
  window['Chessboard']['objToFen'] = objToFen
})()
