const SHA40 = /^[a-f0-9]{40}$/;

export const WRITER_REF_VERIFY_DELAYS_MS = Object.freeze([0, 75, 200, 450]);

function exactSha(value, label) {
  const sha = String(value || '').trim().toLowerCase();
  if (!SHA40.test(sha)) throw new Error(`${label} is missing or invalid.`);
  return sha;
}

async function defaultSleep(milliseconds) {
  if (milliseconds > 0) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

export async function verifyWriterRefAfterUpdate({
  readRef,
  createdCommitSha,
  expectedParentSha,
  delays = WRITER_REF_VERIFY_DELAYS_MS,
  sleep = defaultSleep,
}) {
  if (typeof readRef !== 'function') throw new Error('readRef is required.');
  if (typeof sleep !== 'function') throw new Error('sleep is required.');

  const created = exactSha(createdCommitSha, 'Created commit SHA');
  const parent = exactSha(expectedParentSha, 'Expected parent SHA');
  if (created === parent) throw new Error('Created commit SHA must differ from the expected parent SHA.');
  if (!Array.isArray(delays) || delays.length < 1 || delays.length > 8) {
    throw new Error('A bounded ref-verification delay schedule is required.');
  }

  let lastReadError = null;
  let observedParent = false;

  for (let index = 0; index < delays.length; index += 1) {
    const delay = Number(delays[index]);
    if (!Number.isFinite(delay) || delay < 0 || delay > 2000) {
      throw new Error('Ref-verification delays must be between 0 and 2000 milliseconds.');
    }
    await sleep(delay);

    let observed;
    try {
      observed = exactSha(await readRef(index + 1), 'Observed branch SHA');
    } catch (error) {
      lastReadError = error;
      continue;
    }

    if (observed === created) {
      return { outcome: 'applied', ref_sha: observed, attempts: index + 1 };
    }
    if (observed !== parent) {
      return { outcome: 'conflict', ref_sha: observed, attempts: index + 1 };
    }
    observedParent = true;
  }

  if (observedParent) {
    throw new Error('The updated branch reference still reports the reviewed parent after bounded verification.');
  }
  throw lastReadError instanceof Error
    ? lastReadError
    : new Error('The updated branch reference could not be read after bounded verification.');
}

export const WRITER_REF_VERIFICATION_EVIDENCE = Object.freeze({
  read_retry_only: true,
  ref_update_retried: false,
  second_commit_created: false,
  force_push_allowed: false,
  unexpected_sha_accepted: false,
});
