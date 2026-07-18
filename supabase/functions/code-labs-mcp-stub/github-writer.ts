import { importPKCS8, SignJWT } from "npm:jose@5.9.6";
import forge from "npm:node-forge@1.3.1";
import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;

const REPO = "trevieisking/stream-bandit";
const OWNER = "trevieisking";
const REPO_NAME = "stream