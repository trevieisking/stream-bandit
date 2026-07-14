import { BASE, SCOPE, authorize, binding, register, token } from "./oauth.ts";
import { VERSION, getContext, readUrl, saveRequest } from "./context.ts";
import { acceptCandidate, createCheckpoint, getWorkspace, listActions, listRecords, readCurrentFile, readReceipt, runAction, saveCandidate, selectRecord, undoAction, updateCurrentFile, updateJob, updatePacket, updateProject, updateTest } from "./workspace.ts";
type Row=Record<string,any>;
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
const json=(body:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(body,null,2),{status,headers:{...cors,...extra,"Content-Type":"application/json","Cache-Control":"no-store"}});
const go=(url:string)=>new Response(null,{status:302,headers:{...cors,Location:url,"Cache-Control":"no-store"}});
const rpc=(id:unknown,result:unknown)=>json({jsonrpc:"2.0",id:id??null,result});
const rpcError=(id:unknown,code:number,message:string,status=400)=>json({jsonrpc:"2.0",id:id??null,error:{code,message}},status);
const protectedResource=()=>({resource:BASE,authorization_servers:[BASE],bearer_methods_supported:["header"],scopes_supported:["code_labs.read","code_labs.write"]});
const metadata=()=>({issuer:BASE,authorization_endpoint:BASE+"/oauth/authorize",token_endpoint:BASE+"/oauth/token",registration_endpoint:BASE+"/oauth/register",response_types_supported:["code"],response_modes_supported:["query"],grant_types_supported:["authorization_code","refresh_token"],token_endpoint_auth_methods_supported:["none"],code_challenge_methods_supported:["S256"],scopes_supported:["code_labs.read","code_labs.write"]});
const read={readOnlyHint:true,destructiveHint:false,idempotentHint:true};
const write={readOnlyHint:false,destructiveHint:false,idempotentHint:false};
function tools(){const fields={type:"object",additionalProperties:true};return[
{name:"get_code_labs_context",title:"Get Code Labs Context",description:"Read saved Code Labs projects, jobs, packets, tests, and audit events.",inputSchema:{type:"object",properties:{limit:{type:"number",minimum:1,maximum:25}}},annotations:read},
{name:"read_code_labs_url",title:"Read Code Labs URL",description:"Read a public Code Labs URL.",inputSchema:{type:"object",properties:{url:{type:"string"},max_chars:{type:"number",maximum:60000}},required:["url"]},annotations:read},
{name:"get_code_labs_workspace",title:"Get Code Labs Workspace",description:"Read the owner workspace selection and current project, file, job, packet, and test.",inputSchema:{type:"object",properties:{}},annotations:read},
{name:"list_code_labs_records",title:"List Code Labs Records",description:"List projects, files, jobs, packets, or tests.",inputSchema:{type:"object",properties:{record_type:{type:"string",enum:["project","file","job","packet","test"]},limit:{type:"number",minimum:1,maximum:50}},required:["record_type"]},annotations:read},
{name:"read_code_labs_current_file",title:"Read Current Code Labs File",description:"Read the complete currently selected Code Labs file row.",inputSchema:{type:"object",properties:{}},annotations:read},
{name:"list_code_labs_actions",title:"List Code Labs Actions",description:"List the strict server-side Code Labs action IDs available to V104.",inputSchema:{type:"object",properties:{}},annotations:read},
{name:"read_code_labs_receipt",title:"Read Code Labs Receipt",description:"Read one action receipt or the most recent receipt.",inputSchema:{type:"object",properties:{receipt_id:{type:"string"}}},annotations:read},
{name:"select_code_labs_record",title:"Select Code Labs Record",description:"Select an existing project, file, job, packet, or test without creating a duplicate.",inputSchema:{type:"object",properties:{record_type:{type:"string",enum:["project","file","job","packet","test"]},record_id:{type:"string"},expected_state_version:{type:"number"}},required:["record_type","record_id"]},annotations:write},
{name:"update_code_labs_project",title:"Update Code Labs Project",description:"Update the currently selected project in place.",inputSchema:{type:"object",properties:{fields},required:["fields"]},annotations:write},
{name:"update_code_labs_current_file",title:"Update Current Code Labs File",description:"Update the currently selected file row in place; never creates a duplicate file.",inputSchema:{type:"object",properties:{fields},required:["fields"]},annotations:write},
{name:"update_code_labs_repair_job",title:"Update Code Labs Repair Job",description:"Update the currently selected repair job in place.",inputSchema:{type:"object",properties:{fields},required:["fields"]},annotations:write},
{name:"upsert_code_labs_packet",title:"Upsert Code Labs Packet",description:"Update the selected packet in place. This tool does not create a duplicate packet.",inputSchema:{type:"object",properties:{fields},required:["fields"]},annotations:write},
{name:"save_code_labs_candidate",title:"Save Code Labs Candidate",description:"Save candidate code in the selected file metadata without replacing current_code.",inputSchema:{type:"object",properties:{candidate_code:{type:"string"},note:{type:"string"}},required:["candidate_code"]},annotations:write},
{name:"accept_code_labs_candidate",title:"Accept Code Labs Candidate",description:"Explicitly replace current_code with the saved candidate for the selected file.",inputSchema:{type:"object",properties:{confirmed:{type:"boolean"}},required:["confirmed"]},annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:false}},
{name:"upsert_code_labs_test_result",title:"Upsert Code Labs Test Result",description:"Update the selected test result in place. This tool does not create a duplicate test row.",inputSchema:{type:"object",properties:{fields},required:["fields"]},annotations:write},
{name:"create_code_labs_checkpoint",title:"Create Code Labs Checkpoint",description:"Create one deliberate version checkpoint from the selected current file.",inputSchema:{type:"object",properties:{label:{type:"string"},note:{type:"string"},confirmed:{type:"boolean"}},required:["confirmed"]},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false}},
{name:"run_code_labs_action",title:"Run Code Labs Action",description:"Run one strict server-side Code Labs action ID. This does not click a browser page.",inputSchema:{type:"object",properties:{action:{type:"string"},record_id:{type:"string"},expected_state_version:{type:"number"},confirmed:{type:"boolean"},label:{type:"string"},note:{type:"string"},fields,candidate_code:{type:"string"}},required:["action"]},annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:false}},
{name:"undo_code_labs_action",title:"Undo Code Labs Action",description:"Undo one eligible in-place Code Labs write by receipt ID.",inputSchema:{type:"object",properties:{receipt_id:{type:"string"}},required:["receipt_id"]},annotations:write},
{name:"save_code_labs_write_request",title:"Save Code Labs Write Request",description:"Queue one full-file GitHub branch and pull-request request. Never writes directly to main.",inputSchema:{type:"object",properties:{repo:{type:"string"},path:{type:"string"},branch:{type:"string"},content:{type:"string"},action:{type:"string"},commit_message:{type:"string"},pr_title:{type:"string"},pr_body:{type:"string"},confirm_branch_pr_only:{type:"boolean"}},required:["repo","path","branch","content","commit_message","pr_title","confirm_branch_pr_only"]},annotations:write}
];}
async function call(b:any,name:string,args:Row){
if(name==="get_code_labs_context")return getContext(args.limit);
if(name==="read_code_labs_url")return readUrl(args);
if(name==="get_code_labs_workspace")return getWorkspace(b);
if(name==="list_code_labs_records")return listRecords(b,args);
if(name==="read_code_labs_current_file")return readCurrentFile(b);
if(name==="list_code_labs_actions")return listActions();
if(name==="read_code_labs_receipt")return readReceipt(b,args);
if(name==="select_code_labs_record")return selectRecord(b,args);
if(name==="update_code_labs_project")return updateProject(b,args);
if(name==="update_code_labs_current_file")return updateCurrentFile(b,args);
if(name==="update_code_labs_repair_job")return updateJob(b,args);
if(name==="upsert_code_labs_packet")return updatePacket(b,args);
if(name==="save_code_labs_candidate")return saveCandidate(b,args);
if(name==="accept_code_labs_candidate")return acceptCandidate(b,args);
if(name==="upsert_code_labs_test_result")return updateTest(b,args);
if(name==="create_code_labs_checkpoint")return createCheckpoint(b,args);
if(name==="run_code_labs_action")return runAction(b,args);
if(name==="undo_code_labs_action")return undoAction(b,args);
if(name==="save_code_labs_write_request")return saveRequest(b,args);
throw new Error("Unknown tool.");}
Deno.serve(async(req:Request)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});const p=new URL(req.url).pathname;try{
if(p.endsWith("/.well-known/oauth-authorization-server")||p.endsWith("/.well-known/openid-configuration"))return json(metadata());
if(p.endsWith("/.well-known/oauth-protected-resource"))return json(protectedResource());
if(p.endsWith("/oauth/register")&&req.method==="POST")return json(await register(req),201);
if(p.endsWith("/oauth/authorize"))return go(await authorize(req));
if(p.endsWith("/oauth/token")&&req.method==="POST")return json(await token(req));
if(req.method!=="POST")return json({ok:true,version:VERSION,connector:"code-labs-v104",architecture:"tool-only",scope:SCOPE,tools:tools(),endpoint:BASE});
const body=await req.json().catch(()=>({})),id=body.id??null;
if(body.jsonrpc==="2.0"){
if(body.method==="initialize")return rpc(id,{protocolVersion:"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"code-labs-mcp-stub",version:VERSION},instructions:"Use Code Labs V104 server tools directly. No browser pairing, page session, page fingerprint, or live-tab control is used. Read the workspace before writes, update selected records in place, create checkpoints deliberately, inspect receipts, and keep GitHub changes branch and pull-request only."});
if(body.method==="ping")return rpc(id,{});if(body.method==="notifications/initialized")return new Response(null,{status:202,headers:cors});if(body.method==="tools/list")return rpc(id,{tools:tools()});if(body.method==="resources/list")return rpc(id,{resources:[]});if(body.method==="prompts/list")return rpc(id,{prompts:[]});
if(body.method==="tools/call"){const b=await binding(req);const result=await call(b,body.params?.name||"",body.params?.arguments||{});return rpc(id,{content:[{type:"text",text:JSON.stringify(result,null,2)}],structuredContent:result,isError:false});}return rpcError(id,-32601,"Unknown method",404);}
const b=await binding(req);return json(await call(b,body.tool||body.name||"",body));
}catch(e){const message=e instanceof Error?e.message:String(e);const status=/Missing bearer token|OAuth token|sign-in/i.test(message)?401:400;return json({ok:false,version:VERSION,error:message,wrote_database:false,wrote_github:false,opened_pr:false,deleted_anything:false},status,status===401?{"WWW-Authenticate":`Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"`}:{});}});