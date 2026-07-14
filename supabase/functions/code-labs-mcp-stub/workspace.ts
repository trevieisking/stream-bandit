import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;
type RecordType = "project"|"file"|"job"|"packet"|"test";

const TABLES: Record<RecordType,string> = {project:"code_labs_projects",file:"code_labs_files",job:"code_labs_jobs",packet:"code_labs_packets",test:"code_labs_test_runs"};
const STATE_KEYS: Record<RecordType,string> = {project:"current_project_id",file:"current_file_id",job:"current_job_id",packet:"current_packet_id",test:"current_test_run_id"};
const ALLOWED_ACTIONS = [
  "setup.save","project.select","file.select","job.select","packet.select","test.select",
  "file.replace_current","repair.save","packet.build","canvas.load_packet","canvas.save_candidate",
  "candidate.save","candidate.accept","test.record","checkpoint.create","github.prepare_request",
  "workflow.advance","workflow.reset"
] as const;

function cleanObject(value:unknown,max=350000){const text=JSON.stringify(value||{});if(text.length>max)throw new Error("Payload is too large.");return JSON.parse(text);}
function changed(before:Row,after:Row){return Object.keys(after).filter((key)=>JSON.stringify(before?.[key])!==JSON.stringify(after?.[key]));}
async function digest(value:unknown){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(value??null)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");}
async function one(path:string){const rows=await rest(path);return Array.isArray(rows)?rows[0]||null:null;}
async function latest(owner:string