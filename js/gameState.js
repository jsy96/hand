let score = { player: 0, computer: 0, draws: 0, rounds: 0 };
let cooldown = false;

const onResultCb = [];

export function onResult(cb) { onResultCb.push(cb); }
export function getScore() { return score; }
export function isCooldown() { return cooldown; }

export function resolveRound(playerGesture) {
  if (cooldown) return;
  cooldown = true;

  const choices = ["ROCK", "PAPER", "SCISSORS"];
  const computerGesture = choices[Math.floor(Math.random() * 3)];
  const result = determineWinner(playerGesture, computerGesture);

  if (result === "WIN") score.player++;
  else if (result === "LOSE") score.computer++;
  else score.draws++;
  score.rounds++;

  onResultCb.forEach((cb) => cb(playerGesture, computerGesture, result));

  setTimeout(() => { cooldown = false; }, 1800);
}

function determineWinner(player, computer) {
  if (player === computer) return "DRAW";
  if (
    (player === "ROCK" && computer === "SCISSORS") ||
    (player === "PAPER" && computer === "ROCK") ||
    (player === "SCISSORS" && computer === "PAPER")
  ) return "WIN";
  return "LOSE";
}
