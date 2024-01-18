export function dice(probability: number): boolean {
  return Math.random() < probability
}

export function randomChoice<T extends string>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomChoices<T extends string>(arr: T[], count: number): T[] {
  const result = new Set<T>()
  while (result.size < count) {
    result.add(randomChoice(arr))
  }
  return [...result]
}

export function createRandomWord(): string {
  const length = Math.floor(Math.random() * 10) + 1
  let word = ''
  for (let i = 0; i < length; i++) {
    word += String.fromCharCode(Math.floor(Math.random() * 26) + 97)
  }
  return word
}
