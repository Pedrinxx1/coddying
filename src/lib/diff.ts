// Comparação simples linha a linha (LCS) para o histórico do playground.

export type DiffLine = { tipo: "igual" | "add" | "del"; texto: string };

export function diffLinhas(antigo: string, novo: string): DiffLine[] {
  const a = antigo.split("\n");
  const b = novo.split("\n");
  const n = a.length;
  const m = b.length;

  // matriz LCS
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ tipo: "igual", texto: a[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      out.push({ tipo: "del", texto: a[i]! });
      i++;
    } else {
      out.push({ tipo: "add", texto: b[j]! });
      j++;
    }
  }
  while (i < n) out.push({ tipo: "del", texto: a[i++]! });
  while (j < m) out.push({ tipo: "add", texto: b[j++]! });
  return out;
}

export function resumoDiff(linhas: DiffLine[]) {
  return {
    adicionadas: linhas.filter((l) => l.tipo === "add").length,
    removidas: linhas.filter((l) => l.tipo === "del").length,
  };
}
