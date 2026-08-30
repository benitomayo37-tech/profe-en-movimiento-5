export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type Promotion = Exclude<PieceType, "p" | "k">;
export type Piece = { color: Color; type: PieceType };
export type Move = { from: number; to: number; promotion?: Promotion; castle?: "k" | "q"; enPassant?: boolean };
export type Result = "playing" | "checkmate" | "stalemate" | "draw-50" | "draw-repetition" | "draw-material" | "draw-agreement" | "resigned";

export interface ChessState {
  board: Array<Piece | null>;
  turn: Color;
  castling: { wk: boolean; wq: boolean; bk: boolean; bq: boolean };
  enPassant: number | null;
  halfmove: number;
  fullmove: number;
  san: string[];
  keys: string[];
  result: Result;
  winner: Color | null;
}

const back: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
export const files = "abcdefgh";
export const opposite = (color: Color): Color => color === "w" ? "b" : "w";
export const squareName = (square: number) => `${files[square % 8]}${8 - Math.floor(square / 8)}`;
export const squareIndex = (name: string) => (8 - Number(name[1])) * 8 + files.indexOf(name[0]);

export function initialState(): ChessState {
  const board: Array<Piece | null> = Array(64).fill(null);
  back.forEach((type, file) => { board[file] = { color: "b", type }; board[56 + file] = { color: "w", type }; });
  for (let file = 0; file < 8; file += 1) { board[8 + file] = { color: "b", type: "p" }; board[48 + file] = { color: "w", type: "p" }; }
  const state: ChessState = { board, turn: "w", castling: { wk: true, wq: true, bk: true, bq: true }, enPassant: null, halfmove: 0, fullmove: 1, san: [], keys: [], result: "playing", winner: null };
  state.keys = [positionKey(state)];
  return state;
}

export function cloneState(state: ChessState): ChessState {
  return { ...state, board: state.board.map((piece) => piece ? { ...piece } : null), castling: { ...state.castling }, san: [...state.san], keys: [...state.keys] };
}

const row = (square: number) => Math.floor(square / 8);
const col = (square: number) => square % 8;
const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const at = (r: number, c: number) => r * 8 + c;

function attackedBy(state: ChessState, square: number, by: Color) {
  const targetRow = row(square), targetCol = col(square);
  const pawnRow = targetRow + (by === "w" ? 1 : -1);
  for (const pawnCol of [targetCol - 1, targetCol + 1]) if (inside(pawnRow, pawnCol)) { const p = state.board[at(pawnRow, pawnCol)]; if (p?.color === by && p.type === "p") return true; }
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) { const r = targetRow + dr, c = targetCol + dc; if (inside(r,c)) { const p=state.board[at(r,c)]; if (p?.color===by&&p.type==="n") return true; } }
  for (const [dr,dc,types] of [[-1,0,"rq"],[1,0,"rq"],[0,-1,"rq"],[0,1,"rq"],[-1,-1,"bq"],[-1,1,"bq"],[1,-1,"bq"],[1,1,"bq"]] as Array<[number,number,string]>) {
    let r=targetRow+dr,c=targetCol+dc;while(inside(r,c)){const p=state.board[at(r,c)];if(p){if(p.color===by&&types.includes(p.type))return true;break;}r+=dr;c+=dc;
    }
  }
  for(let dr=-1;dr<=1;dr+=1)for(let dc=-1;dc<=1;dc+=1)if(dr||dc){const r=targetRow+dr,c=targetCol+dc;if(inside(r,c)){const p=state.board[at(r,c)];if(p?.color===by&&p.type==="k")return true;}}
  return false;
}

export function inCheck(state: ChessState, color: Color) {
  const king=state.board.findIndex((piece)=>piece?.color===color&&piece.type==="k");
  return king >= 0 && attackedBy(state, king, opposite(color));
}

function rayMoves(state: ChessState, from: number, color: Color, dirs: Array<[number,number]>) {
  const moves: Move[]=[];for(const[dr,dc]of dirs){let r=row(from)+dr,c=col(from)+dc;while(inside(r,c)){const to=at(r,c),p=state.board[to];if(!p)moves.push({from,to});else{if(p.color!==color)moves.push({from,to});break;}r+=dr;c+=dc;}}return moves;
}

function pseudoMoves(state: ChessState, from: number, includeCastle = true): Move[] {
  const piece=state.board[from];if(!piece)return[];const moves:Move[]=[],r=row(from),c=col(from),push=(rr:number,cc:number)=>{if(!inside(rr,cc))return;const to=at(rr,cc),target=state.board[to];if(!target||target.color!==piece.color)moves.push({from,to});};
  if(piece.type==="p"){
    const dir=piece.color==="w"?-1:1,start=piece.color==="w"?6:1,promotionRow=piece.color==="w"?0:7,oneR=r+dir;
    if(inside(oneR,c)&&!state.board[at(oneR,c)]){const to=at(oneR,c);if(oneR===promotionRow)for(const promotion of ["q","r","b","n"] as Promotion[])moves.push({from,to,promotion});else moves.push({from,to});const twoR=r+dir*2;if(r===start&&!state.board[at(twoR,c)])moves.push({from,to:at(twoR,c)});}
    for(const dc of [-1,1]){const cr=r+dir,cc=c+dc;if(!inside(cr,cc))continue;const to=at(cr,cc),target=state.board[to];if(target&&target.color!==piece.color){if(cr===promotionRow)for(const promotion of ["q","r","b","n"] as Promotion[])moves.push({from,to,promotion});else moves.push({from,to});}else if(state.enPassant===to)moves.push({from,to,enPassant:true});}
  }
  if(piece.type==="n")for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])push(r+dr,c+dc);
  if(piece.type==="b")return rayMoves(state,from,piece.color,[[-1,-1],[-1,1],[1,-1],[1,1]]);
  if(piece.type==="r")return rayMoves(state,from,piece.color,[[-1,0],[1,0],[0,-1],[0,1]]);
  if(piece.type==="q")return rayMoves(state,from,piece.color,[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
  if(piece.type==="k"){
    for(let dr=-1;dr<=1;dr+=1)for(let dc=-1;dc<=1;dc+=1)if(dr||dc)push(r+dr,c+dc);
    if(includeCastle&&!inCheck(state,piece.color)){
      const home=piece.color==="w"?60:4,enemy=opposite(piece.color),rights=piece.color==="w"?state.castling.wk:state.castling.bk;
      if(from===home&&rights&&!state.board[home+1]&&!state.board[home+2]&&state.board[home+3]?.type==="r"&&!attackedBy(state,home+1,enemy)&&!attackedBy(state,home+2,enemy))moves.push({from,to:home+2,castle:"k"});
      const qrights=piece.color==="w"?state.castling.wq:state.castling.bq;
      if(from===home&&qrights&&!state.board[home-1]&&!state.board[home-2]&&!state.board[home-3]&&state.board[home-4]?.type==="r"&&!attackedBy(state,home-1,enemy)&&!attackedBy(state,home-2,enemy))moves.push({from,to:home-2,castle:"q"});
    }
  }
  return moves;
}

function applyRaw(state: ChessState, move: Move) {
  const next=cloneState(state),piece=next.board[move.from];if(!piece)return next;next.board[move.from]=null;
  if(move.enPassant)next.board[move.to+(piece.color==="w"?8:-8)]=null;
  next.board[move.to]={...piece,type:move.promotion||piece.type};
  if(move.castle){const rookFrom=move.castle==="k"?move.to+1:move.to-2,rookTo=move.castle==="k"?move.to-1:move.to+1;next.board[rookTo]=next.board[rookFrom];next.board[rookFrom]=null;}
  return next;
}

export function legalMoves(state: ChessState, from?: number) {
  if(state.result!=="playing")return[];const moves:Move[]=[];state.board.forEach((piece,index)=>{if(piece?.color!==state.turn||(from!==undefined&&index!==from))return;for(const move of pseudoMoves(state,index)){const next=applyRaw(state,move);if(!inCheck(next,piece.color))moves.push(move);}});return moves;
}

function positionKey(state: ChessState){return state.board.map(p=>p?`${p.color}${p.type}`:"--").join("")+`/${state.turn}/${Object.entries(state.castling).filter(([,v])=>v).map(([k])=>k).join("")}/${state.enPassant??"-"}`;}
function insufficient(state:ChessState){const pieces=state.board.map((p,i)=>p?{...p,i}:null).filter(Boolean) as Array<Piece&{i:number}>;const nonKings=pieces.filter(p=>p.type!=="k");if(nonKings.length===0)return true;if(nonKings.length===1&&["b","n"].includes(nonKings[0].type))return true;if(nonKings.every(p=>p.type==="b")){const colors=new Set(nonKings.map(p=>(row(p.i)+col(p.i))%2));return colors.size===1;}return false;}
const letters:Record<Exclude<PieceType,"p">,string>={k:"K",q:"Q",r:"R",b:"B",n:"N"};
function sanFor(state:ChessState,move:Move,next:ChessState,capture:boolean){const piece=state.board[move.from]!;if(move.castle)return move.castle==="k"?"O-O":"O-O-O";let value=piece.type==="p"?(capture?files[col(move.from)]:""):letters[piece.type as Exclude<PieceType,"p">];if(piece.type!=="p"){const rivals=legalMoves(state).filter(m=>m.to===move.to&&m.from!==move.from&&state.board[m.from]?.type===piece.type);if(rivals.length){const sameFile=rivals.some(m=>col(m.from)===col(move.from)),sameRank=rivals.some(m=>row(m.from)===row(move.from));value+=!sameFile?files[col(move.from)]:!sameRank?String(8-row(move.from)):squareName(move.from);}}value+=(capture?"x":"")+squareName(move.to);if(move.promotion)value+=`=${letters[move.promotion]}`;const replies=legalMoves({...next,result:"playing"});if(inCheck(next,next.turn))value+=replies.length?"+":"#";return value;}

export function makeMove(state:ChessState,move:Move){const candidate=legalMoves(state,move.from).find(m=>m.to===move.to&&(m.promotion||"q")===(move.promotion||"q"));if(!candidate)return null;const piece=state.board[candidate.from]!,captured=Boolean(state.board[candidate.to])||Boolean(candidate.enPassant),next=applyRaw(state,candidate);next.castling={...state.castling};if(piece.type==="k"){if(piece.color==="w"){next.castling.wk=false;next.castling.wq=false;}else{next.castling.bk=false;next.castling.bq=false;}}if(piece.type==="r"){if(candidate.from===63)next.castling.wk=false;if(candidate.from===56)next.castling.wq=false;if(candidate.from===7)next.castling.bk=false;if(candidate.from===0)next.castling.bq=false;}if(candidate.to===63)next.castling.wk=false;if(candidate.to===56)next.castling.wq=false;if(candidate.to===7)next.castling.bk=false;if(candidate.to===0)next.castling.bq=false;next.enPassant=piece.type==="p"&&Math.abs(candidate.to-candidate.from)===16?(candidate.from+candidate.to)/2:null;next.halfmove=piece.type==="p"||captured?0:state.halfmove+1;next.fullmove=state.fullmove+(state.turn==="b"?1:0);next.turn=opposite(state.turn);next.result="playing";next.winner=null;next.san=[...state.san,sanFor(state,candidate,next,captured)];next.keys=[...state.keys,positionKey(next)];const replies=legalMoves(next);if(!replies.length){if(inCheck(next,next.turn)){next.result="checkmate";next.winner=opposite(next.turn);}else next.result="stalemate";}else if(insufficient(next))next.result="draw-material";else if(next.halfmove>=100)next.result="draw-50";else if(next.keys.filter(k=>k===next.keys.at(-1)).length>=3)next.result="draw-repetition";return next;}

export function pgn(state:ChessState,white="Blancas",black="Negras"){const moves=[];for(let i=0;i<state.san.length;i+=2)moves.push(`${i/2+1}. ${state.san[i]}${state.san[i+1]?` ${state.san[i+1]}`:""}`);const result=state.result==="checkmate"?(state.winner==="w"?"1-0":"0-1"):state.result==="resigned"?(state.winner==="w"?"1-0":"0-1"):state.result==="playing"?"*":"1/2-1/2";return `[Event "Práctica educativa"]\n[White "${white}"]\n[Black "${black}"]\n[Result "${result}"]\n\n${moves.join(" ")} ${result}`;}
export function agreeDraw(state:ChessState){return{...cloneState(state),result:"draw-agreement" as Result,winner:null};}
export function resign(state:ChessState,color:Color){return{...cloneState(state),result:"resigned" as Result,winner:opposite(color)};}
