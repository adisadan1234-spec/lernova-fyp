const IMPERATIVE_ACTIONS = [
  "attend",
  "bring",
  "check",
  "complete",
  "contact",
  "join",
  "prepare",
  "read",
  "register",
  "reply",
  "review",
  "send",
  "submit",
  "upload",
  "visit",
] as const;

const imperativePattern = new RegExp(
  `^(${IMPERATIVE_ACTIONS.join("|")})\\b`,
  "iu",
);
const politeRequestPattern = new RegExp(
  `^please\\s+(${IMPERATIVE_ACTIONS.join("|")})\\b`,
  "iu",
);

type PlainLanguageMeaning = {
  directMeaning: string;
  interpretation: string | null;
};

export function createPlainLanguageMeaning(
  sourceText: string,
): PlainLanguageMeaning {
  return {
    directMeaning: sourceText
      .split(/(\r\n|\r|\n)/u)
      .map((line) => simplifyLine(line))
      .join(""),
    interpretation: null,
  };
}

function simplifyLine(line: string) {
  if (/^(\r\n|\r|\n)$/u.test(line) || line.trim().length === 0) {
    return line;
  }

  const leadingWhitespace = line.match(/^\s*/u)?.[0] ?? "";
  const trailingWhitespace = line.match(/\s*$/u)?.[0] ?? "";
  let meaning = line.trim();
  const removedFormalLeadIn =
    /^please\s+(?:be\s+advised|note)\s+that\s+/iu.test(meaning);

  meaning = meaning
    .replace(/^please\s+be\s+advised\s+that\s+/iu, "")
    .replace(/^please\s+note\s+that\s+/iu, "")
    .replace(/^please\s+ensure\s+that\s+you\s+/iu, "You need to ")
    .replace(/^it\s+is\s+mandatory\s+that\s+you\s+/iu, "You must ")
    .replace(/\byou\s+are\s+required\s+to\b/giu, (phrase) =>
      startsWithUppercase(phrase) ? "You must" : "you must",
    )
    .replace(/\bprior\s+to\b/giu, (phrase) =>
      startsWithUppercase(phrase) ? "Before" : "before",
    )
    .replace(/\bsubsequent\s+to\b/giu, (phrase) =>
      startsWithUppercase(phrase) ? "After" : "after",
    )
    .replace(/\bin\s+the\s+event\s+that\b/giu, (phrase) =>
      startsWithUppercase(phrase) ? "If" : "if",
    )
    .replace(/\bwith\s+regard\s+to\b/giu, (phrase) =>
      startsWithUppercase(phrase) ? "About" : "about",
    )
    .replace(/\bin\s+order\s+to\b/giu, "to")
    .replace(/\butilise\b/giu, (word) =>
      startsWithUppercase(word) ? "Use" : "use",
    )
    .replace(/\bcommence\b/giu, (word) =>
      startsWithUppercase(word) ? "Start" : "start",
    );

  if (removedFormalLeadIn) {
    meaning = uppercaseFirstCharacter(meaning);
  }

  if (politeRequestPattern.test(meaning)) {
    meaning = `The message asks you to ${lowercaseFirstWord(
      meaning.replace(/^please\s+/iu, ""),
    )}`;
  } else if (imperativePattern.test(meaning)) {
    meaning = `You need to ${lowercaseFirstWord(meaning)}`;
  }

  return `${leadingWhitespace}${meaning}${trailingWhitespace}`;
}

function startsWithUppercase(value: string) {
  return value[0] === value[0]?.toUpperCase();
}

function lowercaseFirstWord(value: string) {
  const firstCharacter = value[0];

  return firstCharacter
    ? `${firstCharacter.toLocaleLowerCase("en-GB")}${value.slice(1)}`
    : value;
}

function uppercaseFirstCharacter(value: string) {
  const firstCharacter = value[0];

  return firstCharacter
    ? `${firstCharacter.toLocaleUpperCase("en-GB")}${value.slice(1)}`
    : value;
}
