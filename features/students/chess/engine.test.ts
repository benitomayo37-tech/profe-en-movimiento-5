import assert from "node:assert/strict";
import test from "node:test";
import { inCheck, initialState, legalMoves, makeMove, squareIndex, type ChessState, type Promotion } from "./engine";

function move(state: ChessState, from: string, to: string, promotion?: Promotion) {
  const next = makeMove(state, { from: squareIndex(from), to: squareIndex(to), promotion });
  assert.ok(next, `${from}-${to} debe ser legal`);
  return next;
}

test("posición inicial tiene 20 movimientos legales", () => assert.equal(legalMoves(initialState()).length, 20));

test("jaque mate del loco", () => {
  let state=initialState();state=move(state,"f2","f3");state=move(state,"e7","e5");state=move(state,"g2","g4");state=move(state,"d8","h4");
  assert.equal(state.result,"checkmate");assert.equal(state.winner,"b");assert.equal(state.san.at(-1),"Qh4#");
});

test("enroque corto mueve rey y torre", () => {
  let state=initialState();state=move(state,"e2","e4");state=move(state,"a7","a6");state=move(state,"g1","f3");state=move(state,"a6","a5");state=move(state,"f1","e2");state=move(state,"a5","a4");state=move(state,"e1","g1");
  assert.equal(state.board[squareIndex("g1")]?.type,"k");assert.equal(state.board[squareIndex("f1")]?.type,"r");assert.equal(state.san.at(-1),"O-O");
});

test("captura al paso", () => {
  let state=initialState();state=move(state,"e2","e4");state=move(state,"a7","a6");state=move(state,"e4","e5");state=move(state,"d7","d5");state=move(state,"e5","d6");
  assert.equal(state.board[squareIndex("d5")],null);assert.equal(state.board[squareIndex("d6")]?.type,"p");assert.equal(state.san.at(-1),"exd6");
});

test("promoción seleccionable", () => {
  const state=initialState();state.board=Array(64).fill(null);state.board[squareIndex("e1")]={color:"w",type:"k"};state.board[squareIndex("e8")]={color:"b",type:"k"};state.board[squareIndex("a7")]={color:"w",type:"p"};state.turn="w";state.castling={wk:false,wq:false,bk:false,bq:false};state.keys=[];
  const next=move(state,"a7","a8","n");assert.equal(next.board[squareIndex("a8")]?.type,"n");assert.match(next.san.at(-1)??"",/=N/);
});

test("detecta ahogado", () => {
  const state=initialState();state.board=Array(64).fill(null);state.board[squareIndex("a8")]={color:"b",type:"k"};state.board[squareIndex("c6")]={color:"w",type:"k"};state.board[squareIndex("b6")]={color:"w",type:"q"};state.turn="b";state.castling={wk:false,wq:false,bk:false,bq:false};
  assert.equal(inCheck(state,"b"),false);assert.equal(legalMoves(state).length,0);
});

test("detecta triple repetición", () => {
  let state=initialState();for(let cycle=0;cycle<2;cycle+=1){state=move(state,"g1","f3");state=move(state,"g8","f6");state=move(state,"f3","g1");state=move(state,"f6","g8");}
  assert.equal(state.result,"draw-repetition");
});
