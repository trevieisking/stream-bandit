type Row = Record<string, any>;

type Rule = {
  category: string;
  pattern: RegExp;
  replace: string | ((substring: string, ...args: any[]) => string);
};

const MARKER = "[REDACTED_CREDENTIAL]";

const RULES: Rule[] = [
  {
    category: "private_key",
    pattern: /-----BEGIN ([A-Z0-9 ]*PRIVATE KEY)-----[\s\S]*?-----END \1-----/g,
    replace: (_match: string, label: string) => `-----BEGIN ${label}-----\n${MARKER}\n-----END ${label}-----`,
  },
  {
    category: "github_token",
    pattern: /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/g,
    replace: MARKER,
  },
  {
    category: "provider_api_key",
    pattern: /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9_-]{12,}\b|\bsk-[A-Za-z0-9_-]{20,}\b|\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{12,}\b/g,
    replace: MARKER,
  },
  {
    category: "aws_access_key",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    replace: MARKER,
  },
  {
    category: "jwt_or_access_token",
    pattern: /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/g,
    replace: MARKER,
  },
  {
    category: "bearer_token",
    pattern: /(\bBearer\s+)[A-Za-z0-9._~+\/-]{20,}/gi,
    replace: (_match: string, prefix: string) => prefix + MARKER,
  },
  {
    category: "basic_auth_url",
    pattern: /(https?:\/\/[^\s/:@]+:)[^\s/@]+(@)/gi,
    replace: (_match: string, prefix: string, suffix: string) => prefix + MARKER + suffix,
  },
  {
    category: "named_credential_assignment",
    pattern: /((?:password|passwd|pwd|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|private[_-]?key|service[_-]?role[_-]?key|authorization)\s*[=:]\s*)(["'`])([^\n"'`]{4,})(\2)/gi,
    replace: (_match: string, prefix: string, quote: string) => prefix + quote + MARKER + quote,
  },
  {
    category: "json_named_credential",
    pattern: /(["'](?:password|passwd|pwd|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|private[_-]?key|service[_-]?role[_-]?key|authorization)["']\s*:\s*)(["'])([^\n"']{4,})(\2)/gi,
    replace: (_match: string, prefix: string, quote: string) => prefix + quote + MARKER + quote,
  },
];

export function redactCredentialValues(input: string) {
  let content = String(input || "");
  const counts: Record<string, number> = {};

  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    content = content.replace(pattern, (...args: any[]) => {
      counts[rule.category] = (counts[rule.category] || 0) + 1;
      return typeof rule.replace === "function"
        ? rule.replace(args[0], ...args.slice(1))
        : rule.replace;
    });
  }

  const categories = Object.keys(counts).sort();
  const redactionCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return {
    content,
    metadata: {
      applied: redactionCount > 0,
      redaction_count: redactionCount,
      categories,
      counts,
      marker: MARKER,
      original_values_returned: false,
      identifiers_preserved: true,
      environment_variable_names_preserved: true,
      call_sites_preserved: true,
    },
  };
}

export function protectRepositoryRead(result: Row) {
  if (!result?.file || typeof result.file.content !== "string") {
    return {
      ...result,
      credential_protection: {
        applied: false,
        redaction_count: 0,
        categories: [],
        original_values_returned: false,
      },
    };
  }

  const protectedContent = redactCredentialValues(result.file.content);
  return {
    ...result,
    file: {
      ...result.file,
      content: protectedContent.content,
      redaction: protectedContent.metadata,
    },
    credential_protection: protectedContent.metadata,
  };
}
