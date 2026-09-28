import {
  runtimeV02EvaluateWinner,
  type RuntimeV02MatchFlowSeat,
  type RuntimeV02TerminalState,
} from "./tcg-match-flow-engine-v0-2.ts";
import { runtimeV02RecordTurnOwner } from "./tcg-match-turn-history-v0-2.ts";

export type RuntimeV02PendingTimefold = {
  seat: RuntimeV02MatchFlowSeat;
  turn_seq: number;
  source_action_id: string;
  source_card_uid: string;
  source_card_id: string;
};

export type RuntimeV02TurnAdvanceState = RuntimeV02TerminalState & {
  phase?: unknown;
  active_seat?: unknown;
  turn_seq?: unknown;
  personal_turns?: unknown;
  log?: unknown;
  turn_owner_history?: unknown;
  pending_timefold?: unknown;
  timefold_lock_seat?: unknown;
};

export type RuntimeV02TurnDrawPlan = {
  controller_seat: RuntimeV02MatchFlowSeat;
  card_uid: string;
  source_action_id: "turn_start_draw";
};

export type RuntimeV02TurnDraw = (plan: RuntimeV02TurnDrawPlan) => void;

export type RuntimeV02TurnAdvanceResult =
  | { status: "terminal"; active_seat: RuntimeV02MatchFlowSeat; turn_seq: number }
  | { status: "deckout"; active_seat: RuntimeV02MatchFlowSeat; turn_seq: number; deckout_loser: RuntimeV02MatchFlowSeat }
  | { status: "advanced"; active_seat: RuntimeV02MatchFlowSeat; turn_seq: number; personal_turn: number; draw: RuntimeV02TurnDrawPlan };

function isSeat(value: unknown): value is RuntimeV02MatchFlowSeat { return value === 1 || value === 2; }
function objectRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function requiredTurn(value: unknown): number { const turn=Number(value); if(!Number.isInteger(turn)||turn<0)throw new Error("tcg_v0_2_match_flow_turn_seq_invalid"); return turn; }
function requiredString(value: unknown,error:string):string{const text=typeof value==="string"?value.trim():"";if(!text)throw new Error(error);return text;}
function requiredCardUid(value: unknown): string { return requiredString(value,"tcg_v0_2_match_flow_turn_draw_card_uid_required"); }

function pendingTimefold(state: RuntimeV02TurnAdvanceState): RuntimeV02PendingTimefold | null {
  if(state.pending_timefold==null)return null;
  const raw=objectRecord(state.pending_timefold);if(!raw)throw new Error("tcg_v0_2_timefold_pending_invalid");
  if(!isSeat(raw.seat))throw new Error("tcg_v0_2_timefold_pending_seat_invalid");
  return {
    seat:raw.seat,
    turn_seq:requiredTurn(raw.turn_seq),
    source_action_id:requiredString(raw.source_action_id,"tcg_v0_2_timefold_pending_action_required"),
    source_card_uid:requiredString(raw.source_card_uid,"tcg_v0_2_timefold_pending_source_uid_required"),
    source_card_id:requiredString(raw.source_card_id,"tcg_v0_2_timefold_pending_source_card_required"),
  };
}
function currentLockSeat(state:RuntimeV02TurnAdvanceState):RuntimeV02MatchFlowSeat|null{
  if(state.timefold_lock_seat==null)return null;
  if(!isSeat(state.timefold_lock_seat))throw new Error("tcg_v0_2_timefold_lock_seat_invalid");
  return state.timefold_lock_seat;
}

export function runtimeV02ArmTimefold(state:RuntimeV02TurnAdvanceState,input:{seat:RuntimeV02MatchFlowSeat;turn_seq:number;source_action_id:string;source_card_uid:string;source_card_id:string}):RuntimeV02PendingTimefold{
  if(!state||typeof state!=="object"||Array.isArray(state))throw new Error("tcg_v0_2_timefold_state_required");
  const activeSeat=state.active_seat;if(!isSeat(activeSeat)||activeSeat!==input.seat)throw new Error("tcg_v0_2_timefold_active_seat_mismatch");
  const turn=requiredTurn(state.turn_seq);if(turn!==requiredTurn(input.turn_seq))throw new Error("tcg_v0_2_timefold_turn_changed");
  if(pendingTimefold(state))throw new Error("tcg_v0_2_timefold_already_pending");
  if(currentLockSeat(state)!=null)throw new Error("tcg_v0_2_timefold_chain_blocked");
  const pending={seat:input.seat,turn_seq:turn,source_action_id:requiredString(input.source_action_id,"tcg_v0_2_timefold_action_required"),source_card_uid:requiredString(input.source_card_uid,"tcg_v0_2_timefold_source_uid_required"),source_card_id:requiredString(input.source_card_id,"tcg_v0_2_timefold_source_card_required")};
  state.pending_timefold=structuredClone(pending);return pending;
}
export function runtimeV02TimefoldPendingForSeat(state:RuntimeV02TurnAdvanceState,seat:RuntimeV02MatchFlowSeat):boolean{
  const pending=pendingTimefold(state);if(!pending)return false;
  if(!isSeat(state.active_seat)||state.active_seat!==pending.seat)throw new Error("tcg_v0_2_timefold_pending_active_seat_changed");
  if(requiredTurn(state.turn_seq)!==pending.turn_seq)throw new Error("tcg_v0_2_timefold_pending_turn_changed");
  return pending.seat===seat;
}
export function runtimeV02CancelPendingTimefold(state:RuntimeV02TurnAdvanceState):void{if(state.pending_timefold!=null)pendingTimefold(state);delete state.pending_timefold;}

function advanceToSeat(state:RuntimeV02TurnAdvanceState,nextSeat:RuntimeV02MatchFlowSeat,draw:RuntimeV02TurnDraw):RuntimeV02TurnAdvanceResult{
  if(!state||typeof state!=="object"||Array.isArray(state))throw new Error("tcg_v0_2_match_flow_turn_state_required");
  const currentSeat=state.active_seat;if(!isSeat(currentSeat))throw new Error("tcg_v0_2_match_flow_active_seat_invalid");
  const currentTurn=requiredTurn(state.turn_seq);
  if(runtimeV02EvaluateWinner(state))return{status:"terminal",active_seat:currentSeat,turn_seq:currentTurn};
  const players=objectRecord(state.players),personalTurns=objectRecord(state.personal_turns);
  if(!players||!personalTurns)throw new Error("tcg_v0_2_match_flow_turn_players_required");
  if(!Array.isArray(state.log))throw new Error("tcg_v0_2_match_flow_log_required");
  const nextPlayer=objectRecord(players[String(nextSeat)]);if(!nextPlayer||!Array.isArray(nextPlayer.deck))throw new Error("tcg_v0_2_match_flow_turn_deck_required");
  const nextTurn=currentTurn+1,nextPersonalTurn=Number(personalTurns[String(nextSeat)]||0)+1;
  if(!Number.isInteger(nextPersonalTurn)||nextPersonalTurn<1)throw new Error("tcg_v0_2_match_flow_personal_turn_invalid");
  if(nextPlayer.deck.length===0){
    state.active_seat=nextSeat;state.turn_seq=nextTurn;personalTurns[String(nextSeat)]=nextPersonalTurn;runtimeV02RecordTurnOwner(state,nextTurn,nextSeat);state.deckout_loser=nextSeat;runtimeV02EvaluateWinner(state);
    return{status:"deckout",active_seat:nextSeat,turn_seq:nextTurn,deckout_loser:nextSeat};
  }
  if(typeof draw!=="function")throw new Error("tcg_v0_2_match_flow_turn_draw_required");
  const first=nextPlayer.deck[0] as Record<string,unknown>|null|undefined;
  const plan={controller_seat:nextSeat,card_uid:requiredCardUid(first?.uid),source_action_id:"turn_start_draw" as const};
  draw(plan);
  state.active_seat=nextSeat;state.turn_seq=nextTurn;personalTurns[String(nextSeat)]=nextPersonalTurn;runtimeV02RecordTurnOwner(state,nextTurn,nextSeat);state.phase="play";state.log.push(`Seat ${nextSeat} begins personal turn ${nextPersonalTurn}.`);
  return{status:"advanced",active_seat:nextSeat,turn_seq:nextTurn,personal_turn:nextPersonalTurn,draw:plan};
}

export function runtimeV02AdvanceTurn(state:RuntimeV02TurnAdvanceState,draw:RuntimeV02TurnDraw):RuntimeV02TurnAdvanceResult{
  const currentSeat=state?.active_seat;if(!isSeat(currentSeat))throw new Error("tcg_v0_2_match_flow_active_seat_invalid");
  const lockSeat=currentLockSeat(state),result=advanceToSeat(state,currentSeat===1?2:1,draw);
  if(result.status!=="terminal"&&lockSeat!=null&&currentSeat!==lockSeat)state.timefold_lock_seat=null;
  return result;
}
export function runtimeV02AdvanceTimefoldTurn(state:RuntimeV02TurnAdvanceState,draw:RuntimeV02TurnDraw):RuntimeV02TurnAdvanceResult{
  const currentSeat=state?.active_seat;if(!isSeat(currentSeat))throw new Error("tcg_v0_2_match_flow_active_seat_invalid");
  if(!runtimeV02TimefoldPendingForSeat(state,currentSeat))throw new Error("tcg_v0_2_timefold_pending_required");
  if(currentLockSeat(state)!=null)throw new Error("tcg_v0_2_timefold_chain_blocked");
  const result=advanceToSeat(state,currentSeat,draw);delete state.pending_timefold;if(result.status==="advanced")state.timefold_lock_seat=currentSeat;return result;
}
