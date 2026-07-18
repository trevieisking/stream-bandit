import { Binding, rest } from "./oauth.ts";
import {
  createCheckpoint as createCheckpointBase,
  getWorkspace,
  listActions as listActionsBase,
  listRecords,
  readCurrentFile,
  readReceipt,
  runAction as runActionBase,
  saveCandidate as saveCandidateBase,
  selectRecord,
  undoAction,
  updateCurrentFile as updateCurrentFileBase,
  updateJob as updateJobBase,
  updatePacket as update