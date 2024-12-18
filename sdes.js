const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
const EXPANSION_PERMUTATION = [4, 1, 2, 3, 2, 3, 4, 1];
const INITIAL_PERMUTATION = [2, 6, 3, 1, 4, 8, 5, 7];
const INVERSE_INITIAL_PERMUTATION = [4, 1, 3, 5, 7, 2, 8, 6];
const P4 = [2, 4, 3, 1];

const S_BOX_0 = [
  ["01", "00", "11", "10"],
  ["11", "10", "01", "00"],
  ["00", "10", "01", "11"],
  ["11", "01", "11", "10"],
];

const S_BOX_1 = [
  ["00", "01", "10", "11"],
  ["10", "00", "01", "11"],
  ["11", "00", "01", "00"],
  ["10", "01", "00", "11"],
];

function generateKeys(key) {
  const permutedKey = P10.map((index) => key[index - 1]);
  const leftHalf = permutedKey.slice(0, 5);
  const rightHalf = permutedKey.slice(5);

  leftHalf.push(leftHalf.shift());
  rightHalf.push(rightHalf.shift());
  const firstShiftedKey = leftHalf.concat(rightHalf);
  const key1 = P8.map((index) => firstShiftedKey[index - 1]);

  leftHalf.push(leftHalf.shift(), leftHalf.shift());
  rightHalf.push(rightHalf.shift(), rightHalf.shift());
  const secondShiftedKey = leftHalf.concat(rightHalf);
  const key2 = P8.map((index) => secondShiftedKey[index - 1]);

  return [key1, key2];
}

function processSDES(inputBits, key, isFirstStep) {
  const permutedInput = isFirstStep
    ? INITIAL_PERMUTATION.map((index) => inputBits[index - 1])
    : inputBits;

  const leftBits = permutedInput.slice(0, 4);
  const rightBits = permutedInput.slice(4);

  const expandedRightBits = EXPANSION_PERMUTATION.map(
    (index) => rightBits[index - 1]
  );

  const xorResult = expandedRightBits.map((bit, index) => bit ^ key[index]);

  const sBox0Input = xorResult.slice(0, 4);
  const sBox1Input = xorResult.slice(4);

  const sBox0Row = parseInt(`${sBox0Input[0]}${sBox0Input[3]}`, 2);
  const sBox0Col = parseInt(`${sBox0Input[1]}${sBox0Input[2]}`, 2);
  const sBox1Row = parseInt(`${sBox1Input[0]}${sBox1Input[3]}`, 2);
  const sBox1Col = parseInt(`${sBox1Input[1]}${sBox1Input[2]}`, 2);

  const sBox0Output = S_BOX_0[sBox0Row][sBox0Col];
  const sBox1Output = S_BOX_1[sBox1Row][sBox1Col];

  const combinedSBoxOutput = (sBox0Output + sBox1Output)
    .split("")
    .map((bit) => parseInt(bit));

  const p4Result = P4.map((index) => combinedSBoxOutput[index - 1]);

  const xorWithLeftBits = p4Result.map((bit, index) => bit ^ leftBits[index]);

  return isFirstStep
    ? rightBits.concat(xorWithLeftBits)
    : xorWithLeftBits.concat(rightBits);
}

function performSDES() {
  const textInput = document.getElementById("text").value;
  const keyInput = document.getElementById("key").value;

  const textIsValid = /^[01]{8}$/.test(textInput);
  const keyIsValid = /^[01]{10}$/.test(keyInput);

  if (!textIsValid) {
    alert(
      "Dane wejściowe muszą zawierać dokładnie 8 znaków składających się z 0 i 1"
    );
    return;
  }

  if (!keyIsValid) {
    alert("Klucz musi mieć dokładnie 10 znaków składających się z 0 i 1");
    return;
  }
  const plaintextBits = document
    .getElementById("text")
    .value.split("")
    .map(Number);
  const keyBits = document.getElementById("key").value.split("").map(Number);

  const [key1, key2] = generateKeys(keyBits);

  const firstStepResult = processSDES(plaintextBits, key1, true);
  const finalResult = processSDES(firstStepResult, key2, false);

  const cipherText = INVERSE_INITIAL_PERMUTATION.map(
    (index) => finalResult[index - 1]
  );

  document.getElementById("result").value = cipherText.join("");
}
