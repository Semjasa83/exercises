const input = document.getElementById('textInput')
const plainOutput = document.getElementById('plainOutput')
const encryptedOutput = document.getElementById('encryptedOutput')
const decryptedOutput = document.getElementById('decryptedOutput')

let keyPair

async function initKeys () {
  keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  )
  console.log(keyPair)
}

function encodeMessage(message){
    return new TextEncoder().encode(message)
}


async function encryptMessage (message) {
  const encoded = encodeMessage(message);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    keyPair.publicKey,
    encoded
  )
  return encrypted
}

async function decryptMessage (ciphertext) {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    keyPair.privateKey,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

async function updateOutput() {
  const value = input.value;

  plainOutput.textContent = value || 'Dein Text erscheint hier';

  if (!value) {
    encryptedOutput.textContent = 'Verschlüsselter Text';
    decryptedOutput.textContent = 'Entschlüsselter Text';
    return;
  }

  const encrypted = await encryptMessage(value);
  const decrypted = await decryptMessage(encrypted);

  encryptedOutput.textContent = 'verschlüsselt: ' + Array.from(new Uint8Array(encrypted)).join(' ');
  decryptedOutput.textContent = 'entschlüsselt: ' + decrypted;
}

async function init() {
  await initKeys();
  input.addEventListener('input', updateOutput);
  updateOutput();
}

init();
